export default function({ $axios, redirect }) {
  $axios.onError(error => {
    if (error.response.status === 500) {
      redirect('/sorry');
    } else if (error.response.status === 404) {
      redirect('/404');
    } else {
      alert(`Error ${error.response.status} raised`);
    }
  });
}
