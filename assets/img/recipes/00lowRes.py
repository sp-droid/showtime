from PIL import Image
import os

def resize_images(target_size=(594, 333)):
    # Define source and destination directories
    source_dir = os.getcwd()
    dest_dir = os.path.join(source_dir, 'lowRes')
    
    # Ensure destination folder exists
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    
    # Process each file in the source directory
    for filename in os.listdir(source_dir):
        if filename.lower().endswith(('png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp')):
            file_path = os.path.join(source_dir, filename)
            
            try:
                with Image.open(file_path) as img:
                    img_resized = img.resize(target_size, Image.LANCZOS)
                    img_resized.save(os.path.join(dest_dir, filename))
                    print(f'Resized and saved: {filename}')
            except Exception as e:
                print(f'Error processing {filename}: {e}')

if __name__ == "__main__":
    resize_images()
