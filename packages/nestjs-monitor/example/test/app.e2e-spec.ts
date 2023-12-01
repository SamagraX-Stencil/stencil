import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ResponseTimeInterceptor } from './../src/interceptors/response-time.interceptor';

function generateRandomNumberWithBellCurve(mean, stdDev) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();

  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + stdDev * z;
}

function findNumberOrNextGreatest(arr, target) {
  let nextGreatest = Infinity;

  for (const num of arr) {
    if (num === target) {
      return num; // Found the exact number
    } else if (num > target && num < nextGreatest) {
      nextGreatest = num; // Found a greater number that is closer to the target
    }
  }

  if (nextGreatest !== Infinity) {
    return nextGreatest; // Return the next greatest number
  } else {
    return null; // No match or next greatest number found
  }
}
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const mean = 400; // Mean of the distribution
    const stdDev = 100; // Standard deviation
    const min = 20;
    const max = 2500;
    const buckets = [
      1, 1.5, 2.25, 3.375, 5.0625, 7.59375, 11.390625, 17.0859375, 25.62890625,
      38.443359375, 57.6650390625, 86.49755859375, 129.746337890625,
      194.6195068359375, 291.92926025390625, 437.8938903808594,
      656.8408355712891, 985.2612533569336, 1477.8918800354004,
      2216.8378200531006, 3325.256730079651, 4987.885095119476,
      7481.8276426792145, 11222.741464018822, 16834.112196028233,
      25251.16829404235, 37876.75244106352, 56815.128661595285,
      85222.69299239293, 127834.03948858939,
    ];

    const counts = {
      '1': 0,
      '1.5': 0,
      '2.25': 0,
      '3.375': 0,
      '5.0625': 0,
      '7.59375': 0,
      '11.390625': 0,
      '17.0859375': 0,
      '25.62890625': 0,
      '38.443359375': 0,
      '57.6650390625': 0,
      '86.49755859375': 0,
      '129.746337890625': 0,
      '194.6195068359375': 0,
      '291.92926025390625': 0,
      '437.8938903808594': 0,
      '656.8408355712891': 0,
      '985.2612533569336': 0,
      '1477.8918800354004': 0,
      '2216.8378200531006': 0,
      '3325.256730079651': 0,
      '4987.885095119476': 0,
      '7481.8276426792145': 0,
      '11222.741464018822': 0,
      '16834.112196028233': 0,
      '25251.16829404235': 0,
      '37876.75244106352': 0,
      '56815.128661595285': 0,
      '85222.69299239293': 0,
      '127834.03948858939': 0,
    };

    // const server = app.getHttpServer();
    const agent = request.agent(app.getHttpServer());
    let totalDelay = 0;
    for (let i = 0; i < 30; i++) {
      const delay = generateRandomNumberWithBellCurve(mean, stdDev);
      totalDelay += delay;
      await agent
        .get(`/route?delay=${delay}`)
        .expect(200)
        .expect('Hello from random route!');

      const resp = await agent.get('/metrics').expect(200);

      // console.log('resp : ', resp.text);
      const promText = resp.text.split('\n');

      expect(promText.includes(`class_response_time_count ${i + 1}`)).toBe(
        true,
      );
      const num = findNumberOrNextGreatest(buckets, delay);
      // console.log('num: ', num);
      for (const size of buckets) {
        if (size >= num) counts[size] += 1;
      }
      // counts[num] += 1;
      const str = `class_response_time_bucket{le="${num}"} ${counts[num]}`;
      // console.log('str: ', str);
      expect(promText.includes(str)).toBe(true);
    }
  });
});
