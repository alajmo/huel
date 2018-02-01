module.exports = dest => {
  return [
    {
      path: `${dest}/*.index.js`,
      webpack: false,
      limit: '100 KB'
    }
  ];
};
