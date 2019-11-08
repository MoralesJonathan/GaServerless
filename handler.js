const { google } = require('googleapis');
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
const jwt = new google.auth.JWT(process.env.GAPI_CLIENT_EMAIL, null, process.env.GAPI_PRIVATE_KEY, scopes);

const getEnv = (origin) => {
  if(/openair(-dev|-prepro)?.everymundo/i.test(origin)){
    const environment = origin.match(/openair(\-dev|\-prepro)?.everymundo.com/i)[1]
    if(environment)
      return environment
    else 
      return '';
  } else {
    return '';
  }
}

module.exports = {
  query: async event => {
    const allowedOrigin = `https://openair${getEnv(event.headers.origin || event.headers.Origin)}.everymundo.com`;
    if(!event.queryStringParameters){
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin
        },
        body: 'Query String Parameters missing'
      }
    } else {
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
                    headers: {
                      "Access-Control-Allow-Origin": allowedOrigin
                    },
                    body: JSON.stringify(gaResult.data.rows)
                  });
                else
                  reject({
                    statusCode: 400,
                    headers: {
                      "Access-Control-Allow-Origin": allowedOrigin
                    },
                    body: JSON.stringify(gaError)
                  });
              }
            )
          }
          else {
            reject({
              statusCode: 401,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin
              },
              body: JSON.stringify(jwtError)
            });
          }
        })
      });
      return rows;
    } catch (rejectionError) {
      console.log({ rejectionError })
      return rejectionError;
    }
    }
  },
  accountSummaries: async event => {
    const allowedOrigin = `https://openair${getEnv(event.headers.origin || event.headers.Origin)}.everymundo.com`;
    try {
      const accounts = await new Promise((resolve, reject) => {
        jwt.authorize(jwtError => {
          if (!jwtError) {
            google.analytics('v3').management.accountSummaries.list(
              {
                'auth': jwt
              },
              (gaError, gaResult) => {
                if (!gaError)
                  resolve({
                    statusCode: 200,
                    headers: {
                      "Access-Control-Allow-Origin": allowedOrigin
                    },
                    body: JSON.stringify(gaResult.data.items)
                  });
                else
                  reject({
                    statusCode: 400,
                    headers: {
                      "Access-Control-Allow-Origin": allowedOrigin
                    },
                    body: JSON.stringify(gaError)
                  });
              })
          }
          else {
            reject({
              statusCode: 401,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin
              },
              body: JSON.stringify(jwtError)
            });
          }
        })
      });
      return accounts;
    } catch (rejectionError) {
      console.log({ rejectionError })
      return rejectionError;
    }
  },
  activeUsers: async event => {
    const allowedOrigin = `https://openair${getEnv(event.headers.origin || event.headers.Origin)}.everymundo.com`;
    try {
      const accounts = await new Promise((resolve, reject) => {
        jwt.authorize(jwtError => {
          if (!jwtError) {
            google.analytics('v3').data.realtime.get({ 'auth': jwt, ids: 'ga:180931864', metrics: 'rt:activeUsers' })
              .then(response => {
                const result = response.data;
                const usersCount = result.totalResults ? +result.rows[0][0] : 0;
                resolve({
                  statusCode: 200,
                  headers: {
                    "Access-Control-Allow-Origin": allowedOrigin
                  },
                  body: JSON.stringify(usersCount)
                });
              })
              .catch(gaError => {
                reject({
                statusCode: 400,
                headers: {
                  "Access-Control-Allow-Origin": allowedOrigin
                },
                body: JSON.stringify(gaError)
              })
              })
          }
          else {
            reject({
              statusCode: 401,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin
              },
              body: JSON.stringify(jwtError)
            });
          }
        })
      });
      return accounts;
    } catch (rejectionError) {
      console.log({ rejectionError })
      return rejectionError;
    }
  }
}