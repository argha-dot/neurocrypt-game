import { randomInt } from "./engine/helper";
import { k0, k1, k2 } from "../../data/passSeq.json";

const genRandomKeys = (length: number): string[] => {
  const keys = "sdfjkl";
  const randomKeys: string[] = [];

  let prevKey = "";
  for (let i = 0; i < length; i++) {
    let randomKey;

    while (true) {
      randomKey = keys[Math.floor(Math.random() * keys.length)];

      if (randomKey === prevKey) {
        randomKey = keys[Math.floor(Math.random() * keys.length)];
        continue;
      }

      break;
    }
    randomKeys.push(randomKey);
    prevKey = randomKey;
  }

  return randomKeys;
};

export const subBlockGen = (passSeq: string[]): string[] => {
  console.log("[GENERATING TRAINING BLOCK...]");

  let randomKeysCount = 18;
  const subBlock: string[] = [];
  const indexOfPasses: number[] = [];

  let xOne = randomInt(0, randomKeysCount);
  subBlock.push(...genRandomKeys(xOne));
  randomKeysCount -= xOne;
  indexOfPasses.push(subBlock.length);

  for (let i = 0; i < 3; i++) {
    subBlock.push(...passSeq);

    let randomKeyLength = randomInt(0, randomKeysCount);
    subBlock.push(...genRandomKeys(randomKeyLength));
    indexOfPasses.push(subBlock.length);
    randomKeysCount -= randomKeyLength;
  }

  indexOfPasses.pop();
  // add the remaining number of noise cues.
  subBlock.push(...genRandomKeys(randomKeysCount));
  console.log(indexOfPasses, subBlock);

  console.log(subBlock.length);
  return subBlock;
};

export const authBlockGen = (passSeq: string[]): string[] => {
  console.log("[GENERATING AUTH BLOCK...]");
  const authBlock: string[] = [];

  const init = [0, 1, 2, 0, 1, 2];
  const pi: number[] = [];

  const { 0: k_one, 1: k_two } = [k0, k1, k2].filter(
    (arr) => arr[0] !== passSeq[0]
  );
  const MAP = [
    passSeq,
    k_one.map((k) => k.toLowerCase()),
    k_two.map((k) => k.toLowerCase()),
  ];

  for (let i = 0; i < 6; i++) {
    const randIndex = Math.floor(Math.random() * init.length);
    pi.push(init[randIndex]);
    init.toSpliced(randIndex, 1);
  }

  pi.forEach((e) => {
    authBlock.push(...MAP[e]);
  });

  console.log(authBlock.length);
  return authBlock;
};
