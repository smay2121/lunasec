import bodyParser from 'body-parser';
import { Router } from 'express';
import {db} from '../db';
import {ensureLoggedIn} from "../auth";
import {GrantType} from "@lunasec/tokenizer-sdk";

export function documentsRouter() {
  const router = Router();

  router.use(ensureLoggedIn);
  router.use(bodyParser.json());

  router.get('/',
    function(req, res, next) {
      db.all('SELECT url FROM documents WHERE user_id = ?', [ req.user.id ], async function(err, rows) {
        if (err) { return next(err); }

        const documents = rows.map((r) => r.url);

        res.json({
          success: true,
          documents: documents
        });
      });
    });

  router.post('/',
    async function(req, res, next) {
      const documentURLs = req.body.documents;

      documentURLs.forEach(documentURL => {
        db.run('INSERT INTO documents (user_id, url) VALUES (?, ?)', [
          req.user.id,
          documentURL,
        ], function(err) {
          console.error(err);
        });
      });
      return res.json({
        success: true
      })
    });

  return router;
}
