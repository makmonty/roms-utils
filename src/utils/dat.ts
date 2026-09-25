import fs from 'fs';
import { Parser as XmlParser } from 'xml2js';

export async function getDatContent(path: string) {
  console.log('Reading dat file', path)
  const xmlContent = await fs.promises.readFile(path);
  const parser = new XmlParser();
  const dat = parser.parseStringPromise(xmlContent);
  return dat;
}
