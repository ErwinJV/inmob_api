import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

type CommonError = { code: string; detail: object };

@Injectable()
export class CommonService {
  handleExceptions(error: unknown) {
    if ((error as CommonError).code === '23505') {
      throw new BadRequestException((error as CommonError).detail);
    }

    if (error instanceof HttpException) {
      throw error;
    }

    if (!(error instanceof InternalServerErrorException)) {
      throw new InternalServerErrorException(error);
    }
  }
}
