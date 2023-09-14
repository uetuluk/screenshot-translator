import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { createWorker, OEM, PSM } from 'tesseract.js';
import Anthropic from '@anthropic-ai/sdk';
import bodyParser from 'body-parser';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage });

async function initTesseractWorker() {
  const worker = await createWorker({
    logger: progress => console.log(progress)
  });

  await worker.loadLanguage('jpn_vert+eng');
  await worker.initialize('jpn_vert+eng');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  })
  return worker;
}

const worker = await initTesseractWorker();

const anthropic = new Anthropic();

app.post('/upload', upload.single('screenshot'), async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).send('No file uploaded.');
  }

  const image: Buffer = req.file.buffer;

  worker.recognize(image).then(({ data: { text } }) => {
    res.send(text);
  }).catch((error) => {
    console.log(error);
    res.status(500).send(error);
  });
  
});

app.use(bodyParser.json());

app.post('/translate', async (req, res) => {
  if (!req.body.text) {
    return res.status(400).send('No text provided.');
  }
  console.log("Translating: " + req.body.text);
  await anthropic.completions.create({
    model: 'claude-2',
    max_tokens_to_sample: 1000,
    prompt: `${Anthropic.HUMAN_PROMPT} Translate the given text to English and also transliterate:\n${req.body.text}${Anthropic.AI_PROMPT}`,
  }).catch((error) => {
    console.log(error);
    res.status(500).send(error);
  }).then((completion) => {
    console.log(completion);
    res.send(completion?.completion);
  });
});

app.use(express.static('public'));


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
