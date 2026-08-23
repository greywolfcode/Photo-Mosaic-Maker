// DOM Element Storage
//---------------------
const display = document.getElementById("display");
const display_ctx = display.getContext("2d");

// Worker Storage
//----------------
const generation_worker = new Worker(new URL("/scripts/generation_worker.js", window.location.origin));

// Worker Messaging Functions
generation_worker.onmessage = (e) => {
    const mosaic = e.data;
    //replace display image with the new image
    display_ctx.clearRect(0, 0, display.width, display.height);
    display.width = mosaic.width;
    display.height = mosaic.height;
    context.drawImage(mosaic, 0,0);
};

// Image storage
//---------------
const allowed_images = ["png", "jpeg", "jpg", "webp", "bmp"]
const mosaic_images = new Map();

// Event Listeners
//-----------------

//main image loading
document.getElementById("fileInput").addEventListener("change", function(event)
{
    const file = event.target.files[0];

    if (!file)
    {
        return;
    }
    if (!file.type.startsWith("image/"))
    {
        return;
    }
    //browser can't handle all iamge formats
    else if (!allowed_images.includes(file.name.split(".").pop().toLowerCase()))
    {
        return;
    }

    const reader = new FileReader();

    reader.onload = function(item) 
    {
        const image_url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = function()
        {
            display.width = image.width;
            display.height = image.height;
            
            display_ctx.drawImage(image, 0, 0);
            
            URL.revokeObjectURL(image_url)
        }
        image.src = image_url
    }

    reader.readAsDataURL(file);
});

document.getElementById("imageInput").addEventListener("change", function(event)
{
    for (const file of event.target.files)
    {
        if (!file)
        {
            return;
        }
        else if (!file.type.startsWith("image/"))
        {
            return;
        }
        //browser can't handle all iamge formats
        else if (!allowed_images.includes(file.name.split(".").pop().toLowerCase()))
        {
            return;
        }

        //create new canvas to store image
        const canvas = document.createElement("canvas");
        canvas.setAttribute("id", file.name);
        canvas.setAttribute("class", "tiling-image")
        const context = canvas.getContext("2d");
        mosaic_images.set(file.name, canvas)

        const reader = new FileReader();
        reader.onload = function(item) 
        {
            const image_url = URL.createObjectURL(file);
            const image = new Image();
            
            image.onload = function()
            {
                canvas.width = image.width;
                canvas.height = image.height;
                
                context.drawImage(image, 0, 0);
                
                URL.revokeObjectURL(image_url)
            }
            image.src = image_url
        }
        
        reader.readAsDataURL(file);

        document.getElementById("sidebar-left-content").appendChild(canvas);
    }
});

document.getElementById("generate-button").addEventListener("click", async function(event)
{
    //convert images to offscreen canvases 
    const offscreen_display = await createImageBitmap(display);
    const offscreen_mosaic_images = [];
    for (const image of mosaic_images.values())
    {
        offscreen_mosaic_images.push(await createImageBitmap(image));
    }

    generation_worker.postMessage({"mosaic_images": offscreen_mosaic_images, "display": offscreen_display}, [...offscreen_mosaic_images, offscreen_display]);
});