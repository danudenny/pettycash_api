export const parseBool = (value: any) => {
  return !(
    value === 'false' ||
    value === '0' ||
    value === '' ||
    value === undefined
  );
};

export const getPercentage = (num: number) => {
  return num / 100;
}

export const roundToTwo = (num: any) => {
  const epsilon = num + 'e+2';
  return +(Math.round(+epsilon)  + 'e-2');
}
