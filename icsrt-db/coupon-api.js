const { ObjectId } = require('mongodb');

function addCouponAPI(app, connectDB) {
  console.log('🔧 Loading Coupon Management API...');

  // Admin: create or update coupon
  app.post('/api/admin/coupons', async (req, res) => {
    try {
      const database = await connectDB();
      const { code, discountType, discountValue, minimumAmount = 0, expiresAt, isActive = true, description } = req.body || {};
      if (!code || !discountType || !discountValue) {
        return res.status(400).json({ success: false, error: 'code, discountType, discountValue are required' });
      }
      if (!['percentage', 'fixed'].includes(discountType)) {
        return res.status(400).json({ success: false, error: 'discountType must be percentage or fixed' });
      }
      const doc = {
        code: String(code).toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minimumAmount: Number(minimumAmount) || 0,
        description: description || '',
        isActive: Boolean(isActive),
        updatedAt: new Date().toISOString(),
      };
      if (expiresAt) doc.expiresAt = new Date(expiresAt);

      await database.collection('coupons').updateOne(
        { code: doc.code },
        { $set: doc, $setOnInsert: { createdAt: new Date().toISOString() } },
        { upsert: true }
      );

      const saved = await database.collection('coupons').findOne({ code: doc.code });
      return res.json({ success: true, coupon: saved });
    } catch (error) {
      console.error('Create/update coupon error:', error);
      return res.status(500).json({ success: false, error: 'Failed to save coupon' });
    }
  });

  // Admin: list coupons
  app.get('/api/admin/coupons', async (req, res) => {
    try {
      const database = await connectDB();
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const search = (req.query.search || '').trim();
      const sortBy = req.query.sortBy || 'updatedAt';
      const sortOrder = String(req.query.sortOrder).toLowerCase() === 'asc' ? 1 : -1;

      const filter = {};
      if (search) {
        filter.$or = [
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const coll = database.collection('coupons');
      const total = await coll.countDocuments(filter);
      const cursor = coll
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
      const items = await cursor.toArray();

      return res.json({
        success: true,
        coupons: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      });
    } catch (error) {
      console.error('List coupons error:', error);
      return res.status(500).json({ success: false, error: 'Failed to list coupons' });
    }
  });

  // Admin: deactivate coupon
  app.post('/api/admin/coupons/:code/deactivate', async (req, res) => {
    try {
      const database = await connectDB();
      const code = String(req.params.code).toUpperCase();
      const r = await database.collection('coupons').updateOne(
        { code }, { $set: { isActive: false, updatedAt: new Date().toISOString() } }
      );
      if (!r.matchedCount) return res.status(404).json({ success: false, error: 'Coupon not found' });
      const saved = await database.collection('coupons').findOne({ code });
      return res.json({ success: true, coupon: saved });
    } catch (error) {
      console.error('Deactivate coupon error:', error);
      return res.status(500).json({ success: false, error: 'Failed to deactivate coupon' });
    }
  });

  // Admin: reactivate coupon
  app.post('/api/admin/coupons/:code/reactivate', async (req, res) => {
    try {
      const database = await connectDB();
      const code = String(req.params.code).toUpperCase();
      const r = await database.collection('coupons').updateOne(
        { code }, { $set: { isActive: true, updatedAt: new Date().toISOString() } }
      );
      if (!r.matchedCount) return res.status(404).json({ success: false, error: 'Coupon not found' });
      const saved = await database.collection('coupons').findOne({ code });
      return res.json({ success: true, coupon: saved });
    } catch (error) {
      console.error('Reactivate coupon error:', error);
      return res.status(500).json({ success: false, error: 'Failed to reactivate coupon' });
    }
  });

  // Admin: delete coupon
  app.delete('/api/admin/coupons/:code', async (req, res) => {
    try {
      const database = await connectDB();
      const code = String(req.params.code).toUpperCase();
      const r = await database.collection('coupons').deleteOne({ code });
      if (!r.deletedCount) return res.status(404).json({ success: false, error: 'Coupon not found' });
      return res.json({ success: true, deleted: code });
    } catch (error) {
      console.error('Delete coupon error:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete coupon' });
    }
  });

  // Public: validate coupon (alias)
  app.post('/api/coupons/validate', async (req, res) => {
    try {
      const database = await connectDB();
      const { couponCode, orderAmount } = req.body || {};
      if (!couponCode) return res.status(400).json({ success: false, error: 'couponCode is required' });
      const coupon = await database.collection('coupons').findOne({
        code: String(couponCode).toUpperCase(), isActive: true,
        $or: [{ expiresAt: { $gte: new Date() } }, { expiresAt: { $exists: false } }]
      });
      if (!coupon) return res.json({ success: false, valid: false, error: 'Invalid or expired coupon code' });
      let discountAmount = 0;
      const amount = Number(orderAmount) || 0;
      if (amount > 0) {
        if (coupon.discountType === 'percentage') discountAmount = (amount * coupon.discountValue) / 100;
        else if (coupon.discountType === 'fixed') discountAmount = Math.min(coupon.discountValue, amount);
      }
      return res.json({ success: true, valid: true, coupon: { code: coupon.code, description: coupon.description, discountType: coupon.discountType, discountValue: coupon.discountValue, discountAmount, minimumAmount: coupon.minimumAmount, expiresAt: coupon.expiresAt } });
    } catch (error) {
      console.error('Validate coupon error:', error);
      return res.status(500).json({ success: false, error: 'Failed to validate coupon' });
    }
  });
}

module.exports = { addCouponAPI };
