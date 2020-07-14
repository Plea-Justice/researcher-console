// eslint-disable-next-line import/no-extraneous-dependencies
import { ToastProgrammatic as Toast } from 'buefy';

export default function({ $axios, redirect, store }) {
  $axios.onError(err => {
    // eslint-disable-next-line no-console
    console.log(err);

    let message = 'An error has occured contacting the server.';

    if (err.response) {
      if (err.response.data && err.response.data.message) ({ message } = err.response.data);
      else if (err.response.status)
        switch (err.response.status) {
          case 400:
            message = 'There was an error with the request recieved by the server.';
            break;
          case 401:
            message = 'Access to the requested resource is unauthorized.';
            break;
          case 404:
            message = 'The requested resource could not be found.';
            break;
          case 500:
            message = 'An internal server error has occured.';
            break;
          default:
            message = `Error code ${err.response.status} was recieved.`;
            break;
        }
    }

    Toast.open({
      type: 'is-danger',
      message,
      position: 'is-top',
      duration: 3000
    });
  });
}
