// DOM Element Storage
//---------------------
const display = document.getElementById("display");
const display_ctx = display.getContext("2d");

// Image storage
//---------------
const mosaic_images = new Map();

// Mosaic Creation Functions
//---------------------------
function create_mosaic()
{

}
/**
 * Organises tiles into like colours
 */
function organise_tiles()
{

}
/**
 * Gets image to use based on target colour
 * @param {*} target_color 
 */
function get_tile_(target_color)
{

}

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
        if (!file.type.startsWith("image/"))
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

document.getElementById("generate-button").addEventListener("click", function(event)
{
    create_mosaic();
});