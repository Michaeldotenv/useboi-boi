# Hero Video Background Sources

## Current Video
The hero section currently uses a free stock video from Pixabay showing food delivery.

## Recommended Free Video Sources

### 1. **Pixabay** (Currently Used)
- URL: https://pixabay.com/videos/
- License: Free for commercial use
- Quality: High quality, 4K available
- Search terms: "food delivery", "delivery person", "courier", "food service"

### 2. **Pexels Videos**
- URL: https://www.pexels.com/videos/
- License: Free for commercial use
- Quality: Excellent, HD/4K
- Recommended searches:
  - "food delivery"
  - "delivery man"
  - "courier service"
  - "food order"
  - "restaurant delivery"

### 3. **Coverr**
- URL: https://coverr.co/
- License: Free for commercial use
- Quality: High quality, optimized for web
- Categories: Food, Business, People

### 4. **Videvo**
- URL: https://www.videvo.net/
- License: Free (check individual licenses)
- Quality: HD/4K available
- Good selection of delivery and food-related videos

## Specific Video Recommendations

### Food Delivery Videos:
1. **Delivery person handing food to customer**
   - Pexels: Search "food delivery hand"
   - Shows the moment of delivery
   - Creates emotional connection

2. **Courier on bike/scooter**
   - Pixabay: Search "delivery bike"
   - Shows speed and efficiency
   - Urban, modern feel

3. **Food preparation and packaging**
   - Pexels: Search "food packaging"
   - Shows quality and care
   - Restaurant perspective

4. **Happy customer receiving order**
   - Coverr: Browse "People" category
   - Shows satisfaction
   - Builds trust

## Video Optimization Tips

### 1. File Size
- Keep video under 5MB for fast loading
- Use MP4 format (H.264 codec)
- Compress using tools like HandBrake or FFmpeg

### 2. Duration
- 10-20 seconds is ideal for looping
- Seamless loop points work best
- Shorter = faster loading

### 3. Resolution
- 1920x1080 (Full HD) is sufficient
- 1280x720 (HD) for better performance
- Avoid 4K unless necessary

### 4. Hosting Options
- **Local** (public folder): Best for control, but increases bundle size
- **CDN** (Cloudinary, Bunny CDN): Fast, optimized delivery
- **Free CDN** (Pixabay, Pexels): Direct links, but less control

## How to Replace the Video

### Option 1: Use a Different URL
```tsx
<source src="YOUR_VIDEO_URL_HERE.mp4" type="video/mp4" />
```

### Option 2: Use Local Video
1. Download video and place in `public/videos/` folder
2. Update source:
```tsx
<source src="/videos/hero-delivery.mp4" type="video/mp4" />
```

### Option 3: Multiple Sources (Best Practice)
```tsx
<Box as="video" ...>
  <source src="/videos/hero-delivery.webm" type="video/webm" />
  <source src="/videos/hero-delivery.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</Box>
```

## Video Compression Commands

### Using FFmpeg:
```bash
# Compress to web-optimized MP4
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2M -b:a 128k output.mp4

# Create WebM version (better compression)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 1M output.webm

# Resize to 1280x720
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v h264 -b:v 1.5M output.mp4
```

## Performance Considerations

1. **Lazy Loading**: Video loads automatically but consider adding a poster image
2. **Mobile**: Consider using a static image on mobile for better performance
3. **Autoplay**: Works on most browsers when muted
4. **Fallback**: Always provide a fallback image

## Example with Poster Image:
```tsx
<Box
  as="video"
  autoPlay
  loop
  muted
  playsInline
  poster="/images/hero-poster.jpg"
  ...
>
  <source src="/videos/hero-delivery.mp4" type="video/mp4" />
</Box>
```

## Accessibility
- Always include `muted` for autoplay to work
- Use `playsInline` for iOS devices
- Provide meaningful fallback content
- Consider adding captions for accessibility (optional for background videos)
