/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { ToastProgrammatic as Toast } from 'buefy';

// TODO: handle timeout, try to reattempt connection automatically? 500ms -> 1s -> 5s -> fail ?

export default function({ $axios, redirect, store }) {
  $axios.onError(err => {
    // eslint-disable-next-line no-console
    console.log(err);

    let message = 'An error has occurred contacting the server.';

    if (err.response) {
      if (err.response.data && err.response.data.message) ({ message } = err.response.data);
      else if (err.response.status)
        switch (err.response.status) {
          case 400:
            message = '400: Error with the request received by the server';
            break;
          case 401:
            message = '401: Unauthorized access to requested resource';
            break;
          case 404:
            message = '404: The requested resource was not found';
            break;
          case 500:
            message = '500: An internal server error occurred';
            break;
          default:
            message = `Error code ${err.response.status} was received`;
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
