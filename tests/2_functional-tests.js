/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/
var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  const testText = Math.floor(Math.random()*10000000);
  let testId, testId2, testId3;
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function(done) {
      
      test('create tow new threads (because one will removed)', function(done){
      
        chai.request(server)
        .post('/api/threads/fcc')
        .send({text:testText, delete_password:'pass'})
        .end((err, res) => {
          assert.equal(res.status, 200);
        });
        chai.request(server)
        .post('/api/threads/fcc')
        .send({text:testText, delete_password:'pass'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
        
      });
        
    });
    
    suite('GET', function() {
      
      test('most recent 10 threads with most recent 3 replies each', function(done){
        chai.request(server)
          .get('/api/threads/fcc')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isBelow(res.body.length, 11);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'replies');
            assert.isArray(res.body[0].replies);
            assert.isBelow(res.body[0].replies.length, 3);
            testId = res.body[0]._id;
            testId2 = res.body[1]._id;
            done();
          });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('delete thread with good password', function(done){
      
        chai.request(server)
          .delete('/api/threads/fcc')
          .send({ thread_id: testId, delete_password:'pass' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
        
      });
      
      test('delete thread with wrong password', function(done){
        chai.request(server)
          .delete('/api/threads/fcc')
          .send({ thread_id: testId2, delete_password:'wrong' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });
      
    });
    
    suite('PUT', function() {
      
      test('report thread', function(done){
      
        chai.request(server)
          .put('/api/threads/fcc')
          .send({thread_id: testId2})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          });
        
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('reply to thread', function(done){
        chai.request(server)
          .post('/api/replies/fcc')
          .send({thread_id: testId2, text:'a reply'+testText, delete_password:'pass'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            done();
          });
      });
    });
    
    suite('GET', function() {
      test('Get all replies for 1 thread', function(done){
        chai.request(server)
        .get('/api/replies/fcc')
        .query({thread_id: testId2})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          assert.equal(res.body.replies[res.body.replies.length-1].text, 'a reply'+testText);
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('report reply', function(done){
        chai.request(server)
        .put('/api/threads/fcc')
        .send({thread_id:testId2 ,reply_id:testId2})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('delete reply with bad password', function(done){
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: testId2 ,reply_id: testId3, delete_password: 'wrong'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('delete reply with valid password', function(done){
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: testId2 ,reply_id: testId3, delete_password: 'pass'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
  });

});
