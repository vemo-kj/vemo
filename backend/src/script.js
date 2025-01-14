// test-simple.js
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
    stages: [
        { duration: '10s', target: 10 }, // 10초 동안 10명의 가상 사용자
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 }, // 10초 동안 사용자 감소
    ],
};

export default function () {
    const res = http.get('https://vmemo.co.kr/');

    check(res, {
        'status was 200': r => r.status === 200,
    });

    sleep(1);
}
