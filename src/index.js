import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
}

let page = 1 

refs.btnLoadMore.style.display = 'none'; // ховаємо кнопку
refs.form.addEventListener('submit', onSearch) 
refs.btnLoadMore.addEventListener('click', onBtnLoadMore) 


function onSearch(e) {
  e.preventDefault() 

  page = 1
  refs.gallery.innerHTML = '' 

  const name = refs.input.value.trim(); // обрізання пробілів до і після слова


  if (name !== '') {
    fetchGallery(name);

  } else {
    refs.btnLoadMore.style.display = 'none'

    // повідомлення про те, що НЕ знайдено жодного зображення
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    )
  }
}


function onBtnLoadMore() {
  const name = refs.input.value.trim();
  page += 1; // додаємо +1 сторінку яка має +40 картинок
  fetchGallery(name, page); // 
}

// отримання зображень
async function fetchGallery(name, page) {
  const API_URL = 'https://pixabay.com/api/';

  // список параметрів запит на бекенд
    const options = {
      params: {
      key: '34757422-0fa0b656f1bfd5f5e4a4b9d75', // мій персональний ключ з pixabay
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(API_URL, options);

    notification(
      response.data.hits.length, 
      response.data.total 
    );

    createMarkup(response.data); 
  } catch (error) {
    console.log(error);
  }
}


function createMarkup(elements) {
  const markup = elements.hits
    .map(item => {
       return `<div class="photo-card">
        <a  href="${item.largeImageURL}">
              <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy"/>
          </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            ${item.likes}
          </p>
          <p class="info-item">
            <b>Views</b>
            ${item.views}
          </p>
          <p class="info-item">
             <b>Comments</b>
            ${item.comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            ${item.downloads}
          </p>
         </div>
       </div>`
      }
    )
    .join(''); 
  refs.gallery.insertAdjacentHTML('beforeend', markup); 

  simpleLightBox.refresh(); 
}

// екземпляр модального вікна слайдера-зображень
const simpleLightBox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt', 
  captionDelay: 250, 
});

function notification(length, totalHits) {
  // refs.btnLoadMore.classList.add('is-hidden')
  if (length === 0) {

      // повідомлення про те, що НЕ знайдено жодного зображення
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    // refs.btnLoadMore.classList.add('is-hidden')
    return;
  }

  if (page === 1) {
    refs.btnLoadMore.style.display = 'flex'; 

    // повідомлення про кількість знайдених зобрежнь
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`)
  }

  if (length < 40) {
    refs.btnLoadMore.style.display = 'none'; // ховаємо кнопку

      
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

