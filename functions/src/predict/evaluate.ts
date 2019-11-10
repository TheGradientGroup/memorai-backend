import * as request from 'request';
import * as fs from 'fs';
// import * as tf from '@tensorflow/tfjs-node';

const MODELS_URL_BASE = 'https://memoraii.web.app/models';

const MODEL_TEMP_DIRECTORY = '/tmp/models'
const MODEL_DOWNLOAD_PATH = `${MODEL_TEMP_DIRECTORY}/user_model.pb`;

async function downloadModel(modelUrl: string) {
  request.get(modelUrl).pipe(fs.createWriteStream(MODEL_DOWNLOAD_PATH));
}

interface LastModelValues {
  difficultyBefore: Number;
  retreivability: Number;
  stability: Long;
  grade: Number;
}

/**
 * 
 * @param {string} userId The user ID of the learning model to fetch
 */
export async function evaluate(userId: string, values: LastModelValues) {
  const modelUrl = `${MODELS_URL_BASE}/${userId}`;
  const model = downloadModel(modelUrl) as any;
  model.predict(values);
}