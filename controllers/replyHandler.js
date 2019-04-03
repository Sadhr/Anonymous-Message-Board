const mongo    = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectID;
const url      = process.env.DB;

function ReplyHandler(){
  
  this.replyList = (req, res) => {
  
    const board = req.params.board;
    
    mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
    
      if(err) console.log(`Error to connect to the Database: ${err}`);
      
      const collection = client.db().collection(board);
      
      collection.find(
        {_id: new objectId(req.query.thread_id)},
        {
        reported: 0,
        delete_password: 0,
        "replies.delete_password": 0,
        "replies.reported": 0
      }
      ).toArray((err, docs) => {
        res.json(docs[0]);
      });
      
    });
    
  }
  
  this.newReply = (req, res) => {
  
    const board = req.params.board;
    
    const reply = {
      _id: new objectId(),
      text: req.body.text,
      created_on: new Date(),
      delete_password: req.body.delete_password,
      reported: false
    };
    
    mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
    
      if(err) console.log(`Error to connect to the Database: ${err}`);
      
      const collection = client.db().collection(board);
    
      collection.findAndModify(
        {_id: new objectId(req.body.thread_id)},
        [],
        {
          $set: {bumped_on: new Date()},
          $push: { replies: reply  }
        },
        (err, doc) => {}
      );
      
    });
    
    res.redirect(`/b/${board}/${req.body.thread_id}`);
    
  }
  
  this.reportReply = (req, res) => {
    
    const board = req.params.board;
    
    mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
    
      if(err) console.log(`Error to connect to the Database: ${err}`);
      
      const collection = client.db().collection(board);
      
      collection.findAndModify(
        {
          _id: new objectId(req.body.thread_id),
          "replies._id": new objectId(req.body.reply_id)
        },
        [],
        { $set: { "replies.$.reported": true } },
        (err, doc) => {}
      );
      
    });
    
    res.send('success');
    
  }
  
  this.deleteReply = (req, res) => {
  
    const board = req.params.board;
    
     mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
     
       if(err) console.log(`Error to connect to the Database: ${err}`);
      
       const collection = client.db().collection(board);
       
       collection.findAndModify(
        {
          _id: new objectId(req.body.thread_id),
          replies: { $elemMatch: { _id: new objectId(req.body.reply_id), delete_password: req.body.delete_password } },
        },
        [],
        { $set: { "replies.$.text": "[deleted]" } },
        function(err, doc) {
          if (doc.value === null) {
            res.send('incorrect password');
          } else {
            res.send('success');
          }
        });
       
     });
    
  }
  
}

module.exports = ReplyHandler;