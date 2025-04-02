import { IncomingMessage } from 'http';

import { User } from 'src/users/entities/user.entity';

export class RequestMessage extends IncomingMessage {
  user: User;
}
