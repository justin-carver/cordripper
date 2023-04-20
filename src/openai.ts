import { encode } from 'gpt-3-encoder';
import fs from 'fs';

/**
 * Generates a JSONL file for fine-tuning the model using OpenAI's fine-tuning process.
 * @param filePath Path to the JSON file containing the user's messages.
 */
export const generateFineTuneFile = (
  filePath: string,
  prompt: string,
): void => {
  let arr: string[] = [];
  try {
    arr = JSON.parse(fs.readFileSync(filePath, 'utf8')) as [];
  } catch (e) {
    console.error(e);
  }
  for (let x = 0; x < arr.length; x++) {
    const format = `{"prompt":${prompt},"completion":" ${arr[x]
      .replace(/\n/g, '') // remove newlines
      .replace(/'/g, '') // remove single quotes
      .replace(/"/g, '')}####"}\n`; // remove double quotes
    fs.appendFile('training_data.jsonl', format, (error) => error);
  }
};

/**
 * Converts the JSON file to an array of strings, and outputs that to a file.
 * @param dataPath Path to the JSON file containing the user's messages.
 * @param outputPath Path to the JSON file to write the array to.
 * @returns Array of messages from the user.
 */
export const convertDataToJSON = (
  dataPath: string,
  outputPath: string,
): string[] => {
  const data: unknown[] = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as [];

  const user_messages: string[] = [];
  for (let x = 0; x < data.length; x++) {
    data[x][1].content !== '' && user_messages.push(data[x][1].content);
  }

  try {
    fs.writeFile(
      outputPath,
      JSON.stringify(user_messages, null, 2),
      (error) => {
        if (error) {
          console.error('Error while writing to the file:', error);
        } else {
          console.log(`Successfully wrote the array to ${'haik_arr.json'}`);
        }
      },
    );

    return user_messages;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * Encodes an array of strings and outputs the total length of the encoded array (including the prompt)
 * as well as outputting the price of fine-tuning the model with the data.
 * @param arr Array of strings to encode.
 * @param prompt Prompt to use for the encoding.
 */
export const encodeArrayTotal = (arr: string[], prompt: string): void => {
  const p = encode(prompt);
  const totalEncodedArr = [];
  for (const message of arr) {
    const encoded = encode(message);
    totalEncodedArr.push(...p, ...encoded);
  }
  console.log(
    `Token Length (full): ${
      totalEncodedArr.length
    }, Davinci Fine-Tune Price: $${(
      (totalEncodedArr.length / 1000) *
      0.03
    ).toFixed(2)}`,
  );

  console.log(
    `Token Length (halfed): ${
      totalEncodedArr.length * 0.5
    }, Davinci Fine-Tune Price: $${(
      ((totalEncodedArr.length * 0.5) / 1000) *
      0.03
    ).toFixed(2)}`,
  );

  console.log(
    `Token Length (quarter): ${
      totalEncodedArr.length * 0.25
    }, Davinci Fine-Tune Price: $${(
      ((totalEncodedArr.length * 0.25) / 1000) *
      0.03
    ).toFixed(2)}`,
  );
};

export const init = (): void => {
  // Example: convertDataToJSON('user', 'user_output.json');
  // Example: generateFineTuneFile('user_training_data.json', 'This is an example prompt.');
  const arr = JSON.parse(fs.readFileSync('haik_arr.json', 'utf8')) as [];
  encodeArrayTotal(arr, 'Random Haik dialogue: ->');
};
