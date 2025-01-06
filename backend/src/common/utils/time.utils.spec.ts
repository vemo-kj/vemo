import { convertTimeStringToDate } from './time.utils';

describe('Time Utils', () => {
    describe('convertTimeStringToDate', () => {
        it('should convert MM:SS format correctly', () => {
            const result = convertTimeStringToDate('05:30');
            expect(result.getMinutes()).toBe(5);
            expect(result.getSeconds()).toBe(30);
            expect(result.getHours()).toBe(0);
        });

        it('should convert HH:MM:SS format correctly', () => {
            const result = convertTimeStringToDate('01:05:30');
            expect(result.getHours()).toBe(1);
            expect(result.getMinutes()).toBe(5);
            expect(result.getSeconds()).toBe(30);
        });

        it('should throw error for invalid format', () => {
            expect(() => convertTimeStringToDate('invalid')).toThrow();
            expect(() => convertTimeStringToDate('25:00:00')).toThrow();
            expect(() => convertTimeStringToDate('00:60:00')).toThrow();
        });
    });
});
