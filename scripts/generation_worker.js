// Worker Messaging Functions
//----------------------------
onmessage = async function(e) 
{
  const mosaic = create_mosaic(e.data.mosaic_images, e.data.display);
  postMessage(await createImageBitmap(mosaic));
};

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
function deg_to_rad(deg)
{
    return deg * (Math.PI / 180);
}
function rad_to_deg(rad)
{
    return rad * (180 / Math.PI);
} 
function hsv_diff(colour_one, colour_two)
{
    const h_diff = 180 - Math.abs(Math.abs(colour_one[0] - colour_two[0]) - 180);
    const s_diff = Math.abs(colour_one[1] - colour_two[1]);
    const v_diff = Math.abs(colour_one[2] - colour_two[2]);

    return Math.sqrt(0.5 * (h_diff ** 2) + 0.2 * (s_diff ** 2) + 0.2 * (v_diff ** 2))
}

// Mosaic Creation Functions
//---------------------------
function create_mosaic(mosaic_images, display)
{
    //create canvas to store display
    const display_canvas = new OffscreenCanvas(display.width, display.height)
    display_canvas.width = display.width
    display_canvas.height = display.height;
    const display_ctx = display_canvas.getContext("2d")
    display_ctx.drawImage(display, 0, 0)

    //crop selected images for consistent size
    const cropped_tiles = [];
    for (const image of mosaic_images.values())
    {
        //get dimensiosn to crop to
        let length = 0;
        let crop_x = 0;
        let crop_y = 0;
        if (image.height < image.width)
        {
            length = image.height;
            crop_x = (image.width - length) / 2;
        }
        else
        {
            length = image.width;
            crop_y = (image.height - length) / 2;
        }

        //create new canvas to store cropped image
        const new_canvas = document.createElement("canvas");
        new_canvas.width = length;
        new_canvas.height = length;
        const new_context = new_canvas.getContext("2d");
        new_context.drawImage(image, crop_x, crop_y, length, length, 0, 0, length, length)

        //shrink canvas to standard size
        const shrunk_canvas = document.createElement("canvas");
        shrunk_canvas.width = 1080;
        shrunk_canvas.height = 1080;
        const shrunk_context = shrunk_canvas.getContext("2d"); 
        shrunk_context.drawImage(new_canvas, 0, 0, 1080, 1080)

        cropped_tiles.push(new_canvas);
    }

    const tiles = organise_tiles(cropped_tiles);

    //create new image with photo for each pixel
    const canvas = document.createElement("canvas");
    canvas.width = display_canvas.width * 1080;
    canvas.height = display_canvas.height * 1080;
    const context = canvas.getContext("2d");

    for (let y=0; y<height; y++)
    {
        for (let x=0; x<width; x++)
        {
            const pixel_colour = rgb_to_hsv(display_ctx.getImageData(x, y, 1, 1));
            const image_pixel = get_tile(pixel_colour, tiles);
            context.drawImage(image_pixel, 1080 * x, 1080 * y);

        }
    }

}
/**
 * Organises tiles into like colours
 */
function organise_tiles(unsorted_tiles)
{
    let tiles = {"r": [], "y": [], "g": [], "c": [], "b": [], "m": []};
    for (const image of unsorted_tiles)
    {
        const data = get_image_data(image);
        if (data[0] < 60 || data >= 360)
        {
            tiles["r"].append(data);
        }
        else if (data[0] < 120)
        {
            tiles["y"].append(data);
        }
        else if (data[0] < 180)
        {
            tiles["g"].append(data);
        }
        else if (data[0] < 240)
        {
            tiles["c"].append(data);
        }
        else if (data[0] < 300)
        {
            tiles["b"].append(data);
        }
        else if (data[0] < 360)
        {
            tiles["m"].append(data);
        }
    }

    return tiles;
}
/**
 * Gets image to use based on target colour
 * @param {*} target_color 
 */
function get_tile(target_color, tiles)
{
    let colours = [];
    if (target_color[0] < 60 || target_color >= 360)
    {
        colours = tiles["r"];
    }
    else if (target_color[0] < 120)
    {
        colours = tiles["y"];
    }
    else if (target_color[0] < 180)
    {
        colours = tiles["g"];
    }
    else if (target_color[0] < 240)
    {
        colours = tiles["c"];
    }
    else if (target_color[0] < 300)
    {
        colours = tiles["b"];
    }
    else if (target_color[0] < 360)
    {
        colours = tiles["m"];
    }

    colours.sort((a, b) => {
        const a_dist = hsv_diff(a, target_color);
        const b_dist = hsv_diff(b, target_color);

        //want smallest distance
        return a_dist - b_dist;
    })

    return colours[0];
}

/**
 * Creates object to store image in
 * @param {ImageBitmap} image 
 */
function get_image_data(image)
{
    //draw to canvs
    const canvas = new OffscreenCanvas(image.width, image.height)
    canvas.width = image.width
    canvas.height = image.height;
    const context = canvas.getContext("2d")
    context.drawImage(image, 0, 0)


    const width = image.width;
    const height = image.height;
    const total_pixels = width * height;

    //needd to do trigonometric cicular mean for hue since it is in degrees
    let h_sin = 0;
    let h_cos = 0;
    let s = 0;
    let v = 0;

    for (let y=0; y<height; y++)
    {
        for (let x=0; x<width; x++)
        {
            const pixel = context.getImageData(x, y, 1, 1);
            const hsv = rgb_to_hsv(pixel);

            h_sin += Math.sin(deg_to_rad(hsv[0]));
            h_cos += Math.cos(deg_to_rad(hsv[0]));
            s += hsv[1];
            v += hsv[2];
        }
    }

    h = rad_to_deg(Math.atan2(h_sin, h_cos));
    //normalise to ragne (0, 360)
    //min is 0 so it deosn't need to be included
    h = (((h % 360) + 360) % 360);

    s /= total_pixels;
    v /= total_pixels;

    const avg_colour = {"h": h, "s": s, "v": v};

    return {"average colour": avg_colour, "data": canvas, "uses": 0};
}