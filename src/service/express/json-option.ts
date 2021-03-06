import { json } from 'body-parser';
import { Express} from 'express';

import { ExpressOption } from './option';

export function expressJsonOption(): ExpressOption {
    return function(app: Express) {
        app.use(
            json()
        );
    }
}