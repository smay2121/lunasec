import bodyParser from 'body-parser';
import { Router } from 'express';
import {db} from '../db';
import {ensureLoggedIn} from "../auth";

export function userRouter() {
  const router = Router();

  router.use(ensureLoggedIn);
  router.use(bodyParser.json());

  /* GET users listing. */
  router.get('/me',
      (req, res, next) => {
        db.get('SELECT rowid AS id, username, name, ssn FROM users WHERE rowid = ?', [
            req.user.id
          ], async function(err, row) {
          if (err) {
            return res.json({
              success: false,
              error: err.toString()
            });
          }

          // TODO: Handle undefined row.

          const user = {
            id: row.id.toString(),
            username: row.username,
            displayName: row.name,
            ssnToken: row.ssn
          };
          res.json({
              success: true,
              user: user
          });
        });
      });

  router.post('/me',
    async (req, res, next) => {
      const {properties} = req.body;

      const ssn = properties.ssn;

      db.run('UPDATE users SET ssn = ? WHERE rowid = ?', [
        properties.ssn,
        req.user.id
      ], function(err) {
        if (err) {
          return res.json({
            success: false,
            error: err.toString()
          });
        }
        return res.json({
          success: true
        });
      });
    });

  return router;
}
