use tauri_build::{Attributes, WindowsAttributes};

fn main() {
    tauri_build::try_build(
        Attributes::new()
            .windows_attributes(WindowsAttributes::new().window_icon_path("icons/icon.ico")),
    )
    .expect("failed to run tauri-build");
}