import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const PORT = process.env.PORT || 3000

  app.enableCors()

  app.use(cookieParser())
  // Pipe추가
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  app.setGlobalPrefix('/api')

  await app.listen(PORT, () => {
    new Logger(`MODE ${process.env.NODE_ENV.toUpperCase()}`).localInstance.log(
      `APP LISTEN ON PORT : ${PORT}`,
    )
  })
}
bootstrap()
