const imageFile = document.querySelectorAll(".bannerclassImage")
const cropImg = document.getElementById("cropImg")
const cropModal = document.getElementById("modal")
const cropBtn= document.getElementById("cropBtn")

let cropper;

let croppedDataUrls = {}

imageFile.forEach((fileInput) => {

    
    fileInput.addEventListener('change', (e) => {



        const reader = new FileReader();

        reader.onload = (e) => {

            if (e.target.result) {

                cropImg.src = e.target.result;

                cropModal.classList.remove('d-none');

                const imgName = fileInput.getAttribute('name');

                let newCropper = new Cropper(cropImg, {
                    aspectRatio: 1620 / 600,
                    viewMode: 1,
                });

                window.scrollTo(0, 0)

                cropper = { [imgName]: newCropper }


            }
        }

        reader.readAsDataURL(e.target.files[0])
    })

})

cropBtn.addEventListener('click', function () {

    console.log(cropper);


    if (cropper) {

        for (const key in cropper) {
            console.log("changd");
            // let span = document.querySelector(`span-id=${key}`);

            // console.log(span);

            // span.style.backgroundColor = '#4d5154';

            // span.style.color = 'white'

            croppedDataUrls[key] = cropper[key].getCroppedCanvas().toDataURL('image/jpeg');

            cropper[key].destroy();

            cropper = {};


            break;


        }

        console.log(croppedDataUrls);


        cropModal.classList.toggle('d-none')


    }
});



const form = document.getElementById('bannerForm');



form.addEventListener('submit', function (event) {

    event.preventDefault();

    const formData = new FormData(form);

    console.log(formData);

    for (const key in croppedDataUrls) {

        let keyVal = key;

        formData.delete(keyVal);

        const blob = dataURLtoBlob(croppedDataUrls[keyVal]);

        formData.append(keyVal, blob, 'productImg.jpg');

    }

    console.log(formData);
   
    fetch('/admin/addBanner', {
        method: 'POST',

        body: formData,
    })
        .then(response => response.json())
        .then(data => {

            if (data.success) {
               window.location.href = "/admin/banner"
                console.log('success')
                window.scrollTo(0, 0)

            } else {

                window.scrollTo(0, 0)
            }
        })
        .catch(error => {
            // Handle network or other errors here
            alert('Failed to add category data due to local / network issues');
            console.error('Error:', error);
        });
});

function dataURLtoBlob(dataURL) {
    // Split the Data URL to obtain the data part
    const parts = dataURL.split(',');
    const data = parts[1];

    // Get the MIME type from the first part of the Data URL
    const mimeString = parts[0].split(':')[1].split(';')[0];

    // Convert the base64-encoded data to a Blob
    const byteString = atob(data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}