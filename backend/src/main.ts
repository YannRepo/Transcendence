import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import * as cors from "cors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS headers
  app.use(cors());
  app.enableCors();

  // Create a Swagger document for the API go to http://localhost:3000/api-docs/ to see it
  const config = new DocumentBuilder()
    .setTitle("ft_transcendence API")
    .setDescription("All the routes of the ft_transcendence API")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve the Swagger documentation
  SwaggerModule.setup("api-docs", app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

bootstrap();
