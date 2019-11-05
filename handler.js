const { google } = require('googleapis');
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
const jwt = new google.auth.JWT(process.env.GAPI_CLIENT_EMAIL, null, process.env.GAPI_PRIVATE_KEY, scopes);

module.exports.query = async event => {
  const { _src, ...queryParams } = event.queryStringParameters;
  try {
    const rows = await new Promise((resolve, reject) => {
      jwt.authorize(jwtError => {
        if (!jwtError) {
          google.analytics('v3').data.ga.get(
            {
              'auth': jwt,
              ...queryParams
            },
            (gaError, gaResult) => {
              if (!gaError)
                resolve({
                  statusCode: 200,
                  body: JSON.stringify(gaResult.data.rows)
                });
              else
                reject({
                  statusCode: 400,
                  body: JSON.stringify(gaError)
                });
            }
          )
        }
        else {
          reject({
            statusCode: 400,
            body: JSON.stringify(jwtError)
          });
        }
      })
    });
    return rows;
  } catch (rejectionError) {
    console.log({rejectionError})
    return rejectionError;
  }
 

};
