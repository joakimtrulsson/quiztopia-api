# Quiztopa Api

## Beskrivning

Projektet har skapats som en del av en inlärningsprocess för att förstå och behärska AWS och dess olika tjänster. Syftet med projektet är att lära sig och utforska AWS-ekosystemet och serverlös arkitektur.

## Funktioner

- **Hämta ett quiz:** Besökare kan enkelt söka efter alla quiz eller ett specifikt qiuz.
- **Autentisering:** Användare kan skapa konton, logga in, skapa quiz och lägga till frågor till sitt quiz.
- **Säkerhet:** Känslig användardata skyddas med kryptering.
- **Leaderboard:** För att uppmuntra tävling och engagemang har jag implementerat en "Leaderboard" där användare kan se topplistan över poäng och användare för varje quiz. Användare har också möjlighet att registrera sina egna poäng och tävla om högsta platsen på leaderboarden.

## Teknisk Arkitektur

Projektet är uppbyggt med en serverlös arkitektur med hjälp av AWS-tjänster som Lambda, DynamoDB och Serverless. Middleware-hanteringen och autentiseringen hanteras med hjälp av Middy. Användare autentiseras med JsonWebToken (JWT), och lösenord lagras säkert med hjälp av Bcrypt.

## Kom igång

För att komma igång med Quiztopia Api, följ de här stegen:

1. **Klona projektet:** `git clone https://github.com/joakimtrulsson/quiztopia-api`
2. **Installera beroenden:** `npm install`
3. **Konfigurera miljövariabler:** Skapa en `.env`-fil med nödvändiga miljövariabler.
4. **Deploy till AWS:** Använd Serverless Framework för att distribuera projektet till AWS.

## Miljövariabler

Projektet kräver följande miljövariabler:

- `PROFILE`: Din AWS profil.
- `LAMBDA_ROLE`: Din AWS Lambda roll.
- `JWTSECRET`: En hemlig nyckel för att signera JWT-token.
- `JWTEXPIRATION`: Giltigthetstiden för JWT-Token.
