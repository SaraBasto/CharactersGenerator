import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(cors());

interface RandomCharacterResponse {
  row: number;
  col: number;
  character: string;
}

app.get('/randomCharacter', (req: Request, res: Response) => {
  const row = parseInt(req.query.row as string, 10);
  const col = parseInt(req.query.col as string, 10);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));

  const response: RandomCharacterResponse = {
    row: row,
    col: col,
    character: randomCharacter
  };

  res.json(response);
});

app.get('/getCurrentSeconds', (req: Request, res: Response) => {
  const date = new Date();
  const seconds = date.getSeconds();
  const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;

  res.send(secondsString);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});