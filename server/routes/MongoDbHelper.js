/**
 * Created by kouohhashi on 6/12/2020.
 */
import mongodb  from 'mongodb';
import { v1 as uuidv1 } from 'uuid';

/*
 http://mongodb.github.io/node-mongodb-native/2.0/tutorials/crud_operations/
 */

export default class MongoDbHelper {

  constructor (url, db_name) {
    this.url = url;
    this.db_name = db_name
    this.mongoClient = mongodb.MongoClient;
    this.db = null;
  }

  start (callback) {
    this.mongoClient.connect(this.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }, (err, client) => {

      if (err){
        callback(err);
        return;
      }

      this.db = client.db(this.db_name);
      callback(null, this.db)
    });
  }

  collection (collectionName) {

    let mongoDbCollection = this.db.collection(collectionName)
    let collection = {
      insert : (model) => { //TODO: insert many
        return new Promise((resolve, reject) => {
          if (!model._id){
            model._id = uuidv1()
          }
          mongoDbCollection.insertOne(model, (err, result) => {
            if (err) { reject(err); }
            resolve(model);
          });
        });
      },

      update : ( find_param,  upd_param, option_param ) => { //TODO: update many
        return new Promise((resolve, reject) => {

          if (!option_param) {
            mongoDbCollection.updateOne( find_param, upd_param, (err, result) => {
              if (err) { reject(err); }
              resolve(result);
            });
          } else {
            mongoDbCollection.updateOne( find_param, upd_param, option_param, (err, result) => {
              if (err) { reject(err); }
              resolve(result);
            });
          }

        });
      },

      find : (find_param, sort_param, skip, limit) => { //TODO: search
        return new Promise((resolve, reject) => {

          if (sort_param && skip && limit) {

            mongoDbCollection.find(find_param).sort(sort_param).skip(skip).limit(limit).toArray( (err, docs) => {
              if (err) { reject(err); }
              resolve(docs);
            });

          } else if (sort_param, limit) {

            mongoDbCollection.find(find_param).sort(sort_param).limit(limit).toArray( (err, docs) => {
              if (err) { reject(err); }

              resolve(docs);
            });

          } else if (sort_param) {

            mongoDbCollection.find(find_param).sort(sort_param).toArray( (err, docs) => {
              if (err) { reject(err); }
              resolve(docs);
            });

          } else {

            if (skip && limit) {

              mongoDbCollection.find(find_param).sort(sort_param).limit(limit).toArray( (err, docs) => {
                if (err) { reject(err); }
                resolve(docs);
              });
            } else if (limit) {

              mongoDbCollection.find(find_param).limit(limit).toArray( (err, docs) => {
                if (err) { reject(err); }
                resolve(docs);
              });
            } else {

              mongoDbCollection.find(find_param).toArray( (err, docs) => {
                if (err) { reject(err); }
                resolve(docs);
              });
            }
          }
        });
      },

      findById : (id) => {
        return new Promise((resolve, reject) => {
          mongoDbCollection.findOne({_id: id}, (err, doc) => {
            if (err) { reject(err); }
            resolve(doc);
          });
        });
      },

      delete : (id) => { //TODO: delete many
        return new Promise((resolve, reject) => {
          mongoDbCollection.removeOne({_id: id}, (err, result) => {
            if (err) { reject(err); }
            resolve(result);
          });
        });
      },

      findOne : (param) => {
        return new Promise((resolve, reject) => {
          mongoDbCollection.findOne(param, (err, doc) => {
            if (err) { reject(err); }
            resolve(doc);
          });
        });
      },

      count : (param) => {
        return new Promise((resolve, reject) => {
          mongoDbCollection.countDocuments(param, (err, doc) => {
            if (err) { reject(err); }
            resolve(doc);
          });
        });
      },

      get_find_cusor : (find_param, sort_param, skip, limit) => {

        return new Promise((resolve, reject) => {

          if (sort_param && skip && limit) {

            let cursor = mongoDbCollection.find(find_param).sort(sort_param).skip(skip).limit(limit)
            resolve(cursor)

          } else if (sort_param, limit) {

            let cursor = mongoDbCollection.find(find_param).sort(sort_param).limit(limit)
            resolve(cursor)

          } else if (sort_param) {

            let cursor = mongoDbCollection.find(find_param).sort(sort_param)
            resolve(cursor)

          } else {

            if (skip && limit) {

              let cursor = mongoDbCollection.find(find_param).sort(sort_param).limit(limit)
              resolve(cursor)

            } else if (limit) {

              let cursor = mongoDbCollection.find(find_param).limit(limit)
              resolve(cursor)
            } else {

              let cursor = mongoDbCollection.find(find_param)
              resolve(cursor)

            }
          }
        });
      },

      get_next_from_cusor: (cursor) => {

        // console.log("cursor: ", cursor)

        return new Promise((resolve, reject) => {

          cursor.next((err, item) => {
            if (err) {
              reject(err)
            } else {
              resolve(item)
            }
          })

        });
      },

    }

    return collection;
  }

}
