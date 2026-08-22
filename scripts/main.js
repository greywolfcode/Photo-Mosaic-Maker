// DOM Element Storage
//---------------------
const display = document.getElementById("display");
const display_ctx = display.getContext("2d");

// Image storage
//---------------
const mosaic_images = new Map();

// Helper Functions
//------------------
function rgb_to_hsv(rgb)
{
    //normalise values
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[0] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    //calculate h
    let h = 0;
    if (max == min)
    {
        h = 0;
    }
    else if (max == r)
    {
        h = ((60 * ((g - b) / diff)) + 360) % 360;
    }
    else if (max == g)
    {
        h = ((60 * ((b - r) / diff)) + 120) % 360;
    }
    else if (max == b)
    {
        h = ((60 * ((r - g) / diff)) + 240) % 360;
    }

    //calulate s
    let s = 0;
    if (max != 0)
    {
        s = (diff/max) * 100;
    }

    //calulate v
    let v = max * 100;

    return {"h": h, "s": s, "v": v};
}

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

/**
 * Creates object to store image in
 * @param {HTMLCanvasElement} image 
 */
function get_image_data(image)
{
    const width = image.width;
    const height = image.height;
    const total_pixels = width * height;
    const context = image.getContext("2d");

    let r = 0;
    let g = 0;
    let b = 0
    let a = 0;

    for (const y=0; y<height; y++)
    {
        for (const x=0; x<width; x++)
        {
            const pixel = context.getImageData(x, y, 1, 1);

            //Convert to linear colour for better matching
            r += pixel[0] ** 2;
            g += pixel[1] ** 2;
            b += pixel[2] ** 2;
            a += pixel[3] ** 2;
        }
    }

    r /= total_pixels;
    g /= total_pixels;
    b /= total_pixels;
    a /= total_pixels;

    const avg_colour = {"r": Math.sqrt(r), "g": Math.sqrt(g), "b": Math.sqrt(b), "a": Math.sqrt(a)};

    return {"average colour": avg_colour};

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