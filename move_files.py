import os
import shutil

root = "/Users/christolotriet/lotriflow-site"
quit_dir = os.path.join(root, "quit")

files_to_move = [
    ("index.html", "index.html"),
    ("compare.html", "compare.html"),
    ("faq.html", "faq.html"),
    ("health-milestones.html", "milestones.html"),
]

dirs_to_move = ["blog"]

def run():
    if not os.path.exists(quit_dir):
        try:
            os.makedirs(quit_dir)
            print(f"Created {quit_dir}")
        except Exception as e:
            print(f"Failed to create dir: {e}")
            return

    for src_name, dst_name in files_to_move:
        src = os.path.join(root, src_name)
        dst = os.path.join(quit_dir, dst_name)
        if os.path.exists(src):
            try:
                shutil.move(src, dst)
                print(f"Moved {src_name} -> {dst_name}")
            except Exception as e:
                print(f"Failed to move {src_name}: {e}")
        else:
            print(f"Source not found: {src_name}")

    for dir_name in dirs_to_move:
        src = os.path.join(root, dir_name)
        dst = os.path.join(quit_dir, dir_name)
        if os.path.exists(src):
            try:
                shutil.move(src, dst)
                print(f"Moved directory {dir_name}")
            except Exception as e:
                print(f"Failed to move {dir_name}: {e}")

if __name__ == "__main__":
    run()
