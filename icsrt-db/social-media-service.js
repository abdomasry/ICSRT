// ===============================
// SOCIAL MEDIA MANAGEMENT SYSTEM
// ===============================
// Fresh rebuild using MongoDB collections
// Date: August 3, 2025

const { MongoClient, ObjectId } = require('mongodb');

class SocialMediaService {
  constructor(db) {
    this.db = db;
    this.collection = 'social_media_links';
  }

  // Helper to parse MongoDB ObjectId
  parseId(id) {
    try {
      return new ObjectId(id);
    } catch (error) {
      return id; // Return as-is if not a valid ObjectId
    }
  }

  // GET all social media links
  async getAllLinks() {
    try {
      const links = await this.db.collection(this.collection)
        .find({})
        .sort({ order: 1 })
        .toArray();
      
      return {
        success: true,
        data: links,
        count: links.length
      };
    } catch (error) {
      console.error('❌ Get all social links error:', error);
      throw error;
    }
  }

  // GET enabled social media links only (for user-facing footer)
  async getEnabledLinks() {
    try {
      const links = await this.db.collection(this.collection)
        .find({ enabled: true })
        .sort({ order: 1 })
        .toArray();

      return {
        success: true,
        data: links,
        count: links.length
      };
    } catch (error) {
      console.error('❌ Get enabled social links error:', error);
      throw error;
    }
  }

  // GET single social media link
  async getLinkById(id) {
    try {
      const link = await this.db.collection(this.collection)
        .findOne({ _id: this.parseId(id) });
      
      if (!link) {
        return {
          success: false,
          error: 'Social media link not found',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: link
      };
    } catch (error) {
      console.error('❌ Get social link by ID error:', error);
      throw error;
    }
  }

  // CREATE new social media link
  async createLink(linkData) {
    try {
      const { platform, url, icon, label, enabled, order } = linkData;

      // Validation
      if (!platform || !url) {
        return {
          success: false,
          error: 'Platform and URL are required',
          code: 'MISSING_FIELDS'
        };
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (urlError) {
        return {
          success: false,
          error: 'Invalid URL format',
          code: 'INVALID_URL'
        };
      }

      // Get next order if not specified
      let nextOrder = order;
      if (!nextOrder) {
        const lastLink = await this.db.collection(this.collection)
          .findOne({}, { sort: { order: -1 } });
        nextOrder = lastLink ? (lastLink.order || 0) + 1 : 1;
      }

      const newLink = {
        platform: platform.trim(),
        url: url.trim(),
        icon: icon || `fab fa-${platform.toLowerCase()}`,
        label: label || platform,
        enabled: enabled !== false,
        order: nextOrder,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.db.collection(this.collection)
        .insertOne(newLink);

      return {
        success: true,
        data: { ...newLink, _id: result.insertedId },
        message: 'Social media link created successfully'
      };
    } catch (error) {
      console.error('❌ Create social link error:', error);
      throw error;
    }
  }

  // UPDATE social media link
  async updateLink(id, updateData) {
    try {
      const { platform, url, icon, label, enabled, order } = updateData;

      const updates = {
        updatedAt: new Date()
      };

      if (platform) updates.platform = platform.trim();
      if (url) {
        // Validate URL
        try {
          new URL(url);
          updates.url = url.trim();
        } catch (urlError) {
          return {
            success: false,
            error: 'Invalid URL format',
            code: 'INVALID_URL'
          };
        }
      }
      if (icon !== undefined) updates.icon = icon;
      if (label !== undefined) updates.label = label;
      if (enabled !== undefined) updates.enabled = enabled;
      if (order !== undefined) updates.order = order;

      const result = await this.db.collection(this.collection)
        .updateOne(
          { _id: this.parseId(id) },
          { $set: updates }
        );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Social media link not found',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Social media link updated successfully'
      };
    } catch (error) {
      console.error('❌ Update social link error:', error);
      throw error;
    }
  }

  // DELETE social media link
  async deleteLink(id) {
    try {
      const result = await this.db.collection(this.collection)
        .deleteOne({ _id: this.parseId(id) });

      if (result.deletedCount === 0) {
        return {
          success: false,
          error: 'Social media link not found',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Social media link deleted successfully'
      };
    } catch (error) {
      console.error('❌ Delete social link error:', error);
      throw error;
    }
  }

  // REORDER social media links
  async reorderLinks(linksArray) {
    try {
      if (!Array.isArray(linksArray)) {
        return {
          success: false,
          error: 'Links array is required',
          code: 'INVALID_INPUT'
        };
      }

      const bulkOps = linksArray.map((link, index) => ({
        updateOne: {
          filter: { _id: this.parseId(link._id) },
          update: { 
            $set: { 
              order: index + 1,
              updatedAt: new Date()
            }
          }
        }
      }));

      if (bulkOps.length > 0) {
        await this.db.collection(this.collection).bulkWrite(bulkOps);
      }

      return {
        success: true,
        message: 'Social media links reordered successfully'
      };
    } catch (error) {
      console.error('❌ Reorder social links error:', error);
      throw error;
    }
  }

  // Initialize with default data
  async initializeDefaultData() {
    try {
      const count = await this.db.collection(this.collection).countDocuments();
      
      if (count === 0) {
        console.log('📱 Initializing default social media links...');
        
        const defaultLinks = [
          {
            platform: 'Facebook',
            url: 'https://facebook.com/icsrt',
            icon: 'fab fa-facebook',
            label: 'Facebook',
            enabled: true,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            platform: 'Twitter',
            url: 'https://twitter.com/icsrt',
            icon: 'fab fa-twitter',
            label: 'Twitter',
            enabled: true,
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            platform: 'LinkedIn',
            url: 'https://linkedin.com/company/icsrt',
            icon: 'fab fa-linkedin',
            label: 'LinkedIn',
            enabled: true,
            order: 3,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            platform: 'Instagram',
            url: 'https://instagram.com/icsrt',
            icon: 'fab fa-instagram',
            label: 'Instagram',
            enabled: true,
            order: 4,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        await this.db.collection(this.collection).insertMany(defaultLinks);
        console.log(`✅ Inserted ${defaultLinks.length} default social media links`);
      }
    } catch (error) {
      console.error('❌ Initialize default data error:', error);
    }
  }
}

module.exports = { SocialMediaService };
