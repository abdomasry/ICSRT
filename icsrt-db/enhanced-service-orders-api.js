// Enhanced Service Orders API with messaging and user management
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

// Add enhanced service orders endpoints
function addEnhancedServiceOrdersAPI(app, connectDB) {
  console.log("🔧 Loading Enhanced Service Orders API endpoints...");

// GET all service orders for admin with enhanced customer info and messaging
app.get('/api/admin/service-orders/enhanced', async (req, res) => {
  console.log("📋 Enhanced service orders request received");
  try {
    const database = await connectDB();
    const { page = 1, limit = 50, status, search, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Enhanced search functionality
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.organization': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Aggregation pipeline to enhance orders with user data and conversation stats
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userEmail',
          foreignField: 'email',
          as: 'userDetails'
        }
      },
      {
        $addFields: {
          // Enhanced customer info
          customerInfo: {
            $mergeObjects: [
              {
                name: 'Unknown Customer',
                email: '$userEmail',
                phone: 'Not provided',
                whatsapp: null,
                country: 'Not provided',
                organization: 'Not provided',
                designation: 'Not provided',
                profileImage: null,
                joinDate: null,
                lastActive: null
              },
              '$customerInfo',
              {
                $cond: {
                  if: { $gt: [{ $size: '$userDetails' }, 0] },
                  then: {
                    name: {
                      $ifNull: [
                        { $arrayElemAt: ['$userDetails.name', 0] },
                        {
                          $concat: [
                            { $ifNull: [{ $arrayElemAt: ['$userDetails.firstName', 0] }, ''] },
                            ' ',
                            { $ifNull: [{ $arrayElemAt: ['$userDetails.lastName', 0] }, ''] }
                          ]
                        }
                      ]
                    },
                    email: { $arrayElemAt: ['$userDetails.email', 0] },
                    phone: {
                      $ifNull: [
                        { $arrayElemAt: ['$userDetails.phone', 0] },
                        { $arrayElemAt: ['$userDetails.mobile', 0] }
                      ]
                    },
                    whatsapp: {
                      $ifNull: [
                        { $arrayElemAt: ['$userDetails.whatsapp', 0] },
                        { $arrayElemAt: ['$userDetails.phone', 0] },
                        { $arrayElemAt: ['$userDetails.mobile', 0] }
                      ]
                    },
                    country: { $arrayElemAt: ['$userDetails.country', 0] },
                    organization: {
                      $ifNull: [
                        { $arrayElemAt: ['$userDetails.organization', 0] },
                        { $arrayElemAt: ['$userDetails.company', 0] }
                      ]
                    },
                    designation: {
                      $ifNull: [
                        { $arrayElemAt: ['$userDetails.designation', 0] },
                        { $arrayElemAt: ['$userDetails.position', 0] },
                        { $arrayElemAt: ['$userDetails.title', 0] }
                      ]
                    },
                    profileImage: { $arrayElemAt: ['$userDetails.profileImage', 0] },
                    joinDate: { $arrayElemAt: ['$userDetails.createdAt', 0] },
                    lastActive: { $arrayElemAt: ['$userDetails.lastLoginAt', 0] }
                  },
                  else: {}
                }
              }
            ]
          },
          // Message statistics
          messageStats: {
            total: { $size: { $ifNull: ['$messages', []] } },
            unread: {
              $size: {
                $filter: {
                  input: { $ifNull: ['$messages', []] },
                  cond: { $and: [{ $eq: ['$$this.sender', 'user'] }, { $eq: ['$$this.read', false] }] }
                }
              }
            },
            lastMessage: {
              $let: {
                vars: {
                  sortedMessages: {
                    $sortArray: {
                      input: { $ifNull: ['$messages', []] },
                      sortBy: { timestamp: -1 }
                    }
                  }
                },
                in: { $arrayElemAt: ['$$sortedMessages', 0] }
              }
            }
          },
          // Price history with proper defaults
          priceHistory: {
            $ifNull: [
              '$priceHistory',
              [{
                amount: { $ifNull: ['$totalAmount', '$originalAmount', 0] },
                reason: 'Initial quote',
                changedBy: 'system',
                timestamp: { $ifNull: ['$submittedAt', '$createdAt', new Date().toISOString()] }
              }]
            ]
          },
          // Communication channels
          communicationChannels: {
            $mergeObjects: [
              {
                userpage: true,
                whatsapp: false,
                email: true,
                phone: false
              },
              '$communicationChannels',
              {
                whatsapp: {
                  $cond: {
                    if: '$customerInfo.whatsapp',
                    then: true,
                    else: false
                  }
                },
                phone: {
                  $cond: {
                    if: '$customerInfo.phone',
                    then: true,
                    else: false
                  }
                }
              }
            ]
          }
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $project: { userDetails: 0 } } // Remove the temporary userDetails field
    ];
    
    const orders = await database.collection('service-orders').aggregate(pipeline).toArray();
    const total = await database.collection('service-orders').countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      stats: {
        totalOrders: total,
        pendingOrders: await database.collection('service-orders').countDocuments({ status: 'pending' }),
        inProgressOrders: await database.collection('service-orders').countDocuments({ status: 'in-progress' }),
        completedOrders: await database.collection('service-orders').countDocuments({ status: 'completed' }),
        cancelledOrders: await database.collection('service-orders').countDocuments({ status: 'cancelled' })
      }
    });
  } catch (error) {
    console.error('Error fetching enhanced service orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch service orders' });
  }
});

// POST new message to service order conversation
app.post('/api/admin/service-orders/:id/messages', async (req, res) => {
  try {
    const database = await connectDB();
    const { id } = req.params;
    const { message, sender = 'admin', channel = 'userpage', type = 'text', attachments = [] } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }
    
    const messageObj = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender,
      channel,
      type,
      message: message.trim(),
      attachments,
      timestamp: new Date().toISOString(),
      read: false,
      delivered: false,
      metadata: {
        senderInfo: sender === 'admin' ? 'Admin Team' : 'Customer',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    };
    
    const result = await database.collection('service-orders').updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { messages: messageObj },
        $set: { 
          lastMessageAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    if (result.modifiedCount === 1) {
      // Mark admin messages as delivered immediately
      if (sender === 'admin') {
        await database.collection('service-orders').updateOne(
          { 
            _id: new ObjectId(id),
            'messages.id': messageObj.id
          },
          { 
            $set: { 
              'messages.$.delivered': true,
              'messages.$.deliveredAt': new Date().toISOString()
            }
          }
        );
      }
      
      res.json({
        success: true,
        message: 'Message sent successfully',
        messageData: messageObj
      });
    } else {
      res.status(404).json({ success: false, error: 'Service order not found' });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// PUT mark messages as read
app.put('/api/admin/service-orders/:id/messages/mark-read', async (req, res) => {
  try {
    const database = await connectDB();
    const { id } = req.params;
    const { messageIds, markAll = false } = req.body;
    
    let updateQuery;
    if (markAll) {
      updateQuery = {
        $set: {
          'messages.$[].read': true,
          'messages.$[].readAt': new Date().toISOString()
        }
      };
    } else if (messageIds && messageIds.length > 0) {
      updateQuery = {
        $set: {
          'messages.$[elem].read': true,
          'messages.$[elem].readAt': new Date().toISOString()
        }
      };
    } else {
      return res.status(400).json({ success: false, error: 'No messages specified' });
    }
    
    const arrayFilters = markAll ? [] : [{ 'elem.id': { $in: messageIds } }];
    
    const result = await database.collection('service-orders').updateOne(
      { _id: new ObjectId(id) },
      updateQuery,
      { arrayFilters }
    );
    
    if (result.modifiedCount === 1) {
      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } else {
      res.status(404).json({ success: false, error: 'Service order not found' });
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
  }
});

// PUT update service order status
app.put('/api/admin/service-orders/:id/status', async (req, res) => {
  try {
    const database = await connectDB();
    const { id } = req.params;
    const { status, reason = '', notifyCustomer = true } = req.body;
    
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold', 'confirmed', 'ready-for-payment'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }
    
    const order = await database.collection('service-orders').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Service order not found' });
    }
    
    // Create status change message
    const statusMessage = {
      id: `msg-${Date.now()}-status`,
      sender: 'system',
      channel: 'system',
      type: 'status-update',
      message: `Order status changed from "${order.status}" to "${status}"${reason ? `. Reason: ${reason}` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: {
        previousStatus: order.status,
        newStatus: status,
        reason
      }
    };
    
    // Update order
    const result = await database.collection('service-orders').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          statusUpdatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        $push: {
          messages: statusMessage,
          statusHistory: {
            status,
            reason,
            timestamp: new Date().toISOString(),
            changedBy: 'admin'
          }
        }
      }
    );
    
    if (result.modifiedCount === 1) {
      const updatedOrder = await database.collection('service-orders').findOne({ 
        _id: new ObjectId(id) 
      });
      
      res.json({
        success: true,
        message: 'Status updated successfully',
        order: updatedOrder
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  } catch (error) {
    console.error('Error updating service order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// Enhanced price update with better tracking
app.put('/api/admin/service-orders/:id/price/enhanced', async (req, res) => {
  try {
    const database = await connectDB();
    const { id } = req.params;
    const { 
      newPrice, 
      reason, 
      changedBy = 'admin', 
      discountType = null, 
      notifyCustomer = true,
      effectiveDate = null 
    } = req.body;
    
    if (!newPrice || !reason) {
      return res.status(400).json({ 
        success: false, 
        error: 'New price and reason are required' 
      });
    }
    
    const order = await database.collection('service-orders').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Service order not found' });
    }
    
    const originalAmount = order.originalAmount || order.totalAmount || 0;
    const previousAmount = order.totalAmount || 0;
    const newAmount = parseFloat(newPrice);
    const discountApplied = originalAmount > newAmount ? originalAmount - newAmount : 0;
    const priceChange = newAmount - previousAmount;
    
    // Create detailed price history entry
    const priceHistoryEntry = {
      id: `price-${Date.now()}`,
      previousAmount,
      newAmount,
      priceChange,
      discountApplied,
      discountType,
      reason,
      changedBy,
      timestamp: new Date().toISOString(),
      effectiveDate: effectiveDate || new Date().toISOString(),
      metadata: {
        originalAmount,
        totalDiscountFromOriginal: originalAmount - newAmount,
        percentageChange: previousAmount > 0 ? ((priceChange / previousAmount) * 100).toFixed(2) : 0,
        discountPercentage: originalAmount > 0 ? ((discountApplied / originalAmount) * 100).toFixed(2) : 0
      }
    };
    
    // Create detailed system message
    const priceChangeMessage = {
      id: `msg-${Date.now()}-price`,
      sender: 'system',
      channel: 'system',
      type: 'price-update',
      message: `Price ${priceChange >= 0 ? 'increased' : 'decreased'} from $${previousAmount} to $${newAmount}. ${reason}${discountApplied > 0 ? ` (Discount: $${discountApplied})` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: {
        priceChange: {
          previous: previousAmount,
          new: newAmount,
          change: priceChange,
          discount: discountApplied,
          reason
        }
      }
    };
    
    // Update the order
    const updateData = {
      $set: {
        totalAmount: newAmount,
        originalAmount: originalAmount,
        discountApplied: discountApplied,
        discountReason: discountApplied > 0 ? reason : null,
        discountType: discountApplied > 0 ? discountType : null,
        priceUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      $push: {
        priceHistory: priceHistoryEntry,
        messages: priceChangeMessage
      }
    };
    
    const result = await database.collection('service-orders').updateOne(
      { _id: new ObjectId(id) },
      updateData
    );
    
    if (result.modifiedCount === 1) {
      const updatedOrder = await database.collection('service-orders').findOne({ 
        _id: new ObjectId(id) 
      });
      
      res.json({
        success: true,
        message: 'Price updated successfully',
        order: updatedOrder,
        priceChange: {
          previous: previousAmount,
          new: newAmount,
          change: priceChange,
          discount: discountApplied,
          percentage: previousAmount > 0 ? ((priceChange / previousAmount) * 100).toFixed(2) : 0
        }
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update price' });
    }
  } catch (error) {
    console.error('Error updating service order price:', error);
    res.status(500).json({ success: false, error: 'Failed to update price' });
  }
});

// GET conversation history for a specific order
app.get('/api/admin/service-orders/:id/conversation', async (req, res) => {
  try {
    const database = await connectDB();
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const order = await database.collection('service-orders').findOne(
      { _id: new ObjectId(id) },
      { 
        projection: { 
          messages: 1, 
          customerInfo: 1, 
          orderNumber: 1, 
          serviceName: 1,
          status: 1,
          totalAmount: 1
        } 
      }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Service order not found' });
    }
    
    const messages = order.messages || [];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedMessages = messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      conversation: {
        orderInfo: {
          id: order._id,
          orderNumber: order.orderNumber,
          serviceName: order.serviceName,
          status: order.status,
          totalAmount: order.totalAmount,
          customerInfo: order.customerInfo
        },
        messages: paginatedMessages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(messages.length / parseInt(limit)),
          totalMessages: messages.length,
          messagesPerPage: parseInt(limit)
        },
        stats: {
          totalMessages: messages.length,
          unreadMessages: messages.filter(m => m.sender === 'user' && !m.read).length,
          adminMessages: messages.filter(m => m.sender === 'admin').length,
          userMessages: messages.filter(m => m.sender === 'user').length,
          systemMessages: messages.filter(m => m.sender === 'system').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
});

}

console.log("✅ Enhanced Service Orders API endpoints loaded successfully");
module.exports = { addEnhancedServiceOrdersAPI };
