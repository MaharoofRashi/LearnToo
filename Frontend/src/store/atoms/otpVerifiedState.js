import { atom } from 'recoil';

export const otpVerifiedState = atom({
    key: 'otpVerifiedState',
    default: false,
});
