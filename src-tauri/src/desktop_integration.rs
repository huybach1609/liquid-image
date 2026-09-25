use std::fs;
use std::path::{Path, PathBuf};
use tauri::command;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ContextMenuStatus {
    pub platform: String,
    pub is_supported: bool,
    pub is_registered: bool,
    pub installed_path: Option<String>,
    pub configured_formats: Vec<String>,
}

pub type DolphinIntegrationStatus = ContextMenuStatus;

/// Detect directories where KDE Dolphin looks for ServiceMenus
fn get_dolphin_servicemenu_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Ok(home) = std::env::var("HOME") {
        let home_path = Path::new(&home);
        // KDE Plasma 6 (kio servicemenus)
        dirs.push(home_path.join(".local/share/kio/servicemenus"));
        // KDE Plasma 6 (kservices6)
        dirs.push(home_path.join(".local/share/kservices6/ServiceMenus"));
        // KDE Plasma 5 (kservices5)
        dirs.push(home_path.join(".local/share/kservices5/ServiceMenus"));
    }
    dirs
}

/// Determine executable command name or full path for desktop Exec
fn get_executable_command() -> String {
    if let Ok(current_exe) = std::env::current_exe() {
        if let Some(path_str) = current_exe.to_str() {
            // If installed in system bin, simple command name is fine, otherwise full path
            if path_str == "/usr/bin/liquid-image" || path_str == "/usr/local/bin/liquid-image" {
                return "liquid-image".to_string();
            }
            if path_str.contains(' ') {
                return format!("\"{}\"", path_str);
            }
            return path_str.to_string();
        }
    }
    "liquid-image".to_string()
}

/// Generate .desktop content according to the requested formats
pub fn generate_servicemenu_desktop(formats: &[String]) -> String {
    let exec_cmd = get_executable_command();
    let mut actions = Vec::new();
    let mut action_blocks = Vec::new();

    for fmt in formats {
        let clean_fmt = fmt.trim().trim_start_matches('.').to_lowercase();
        if clean_fmt.is_empty() {
            continue;
        }
        let action_name = format!("Convert{}", capitalize(&clean_fmt));
        actions.push(action_name.clone());

        action_blocks.push(format!(
r#"[Desktop Action {action_name}]
Name=Convert to {upper_fmt}
Icon=image-x-generic
Exec={exec_cmd} --headless --convert-to {clean_fmt} %F
"#,
            action_name = action_name,
            upper_fmt = clean_fmt.to_uppercase(),
            exec_cmd = exec_cmd,
            clean_fmt = clean_fmt,
        ));
    }

    // Always include Open in Liquid Image action
    actions.push("OpenInApp".to_string());
    action_blocks.push(format!(
r#"[Desktop Action OpenInApp]
Name=Open with Liquid Image
Icon=liquid-image
Exec={exec_cmd} --open %F
"#,
        exec_cmd = exec_cmd
    ));

    let actions_str = actions.join(";");

    format!(
r#"[Desktop Entry]
Type=Service
ServiceTypes=KonqPopupMenu/Plugin
MimeType=image/jpeg;image/png;image/webp;image/avif;image/gif;image/tiff;image/bmp;image/svg+xml;image/x-icon;image/heic;image/heif;
Actions={actions_str};
X-KDE-Submenu=Convert with Liquid Image
X-KDE-Priority=TopLevel

{action_blocks}
"#,
        actions_str = actions_str,
        action_blocks = action_blocks.join("\n")
    )
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
    }
}

fn is_executable_in_path(cmd: &str) -> bool {
    if let Ok(path) = std::env::var("PATH") {
        for dir in std::env::split_paths(&path) {
            if dir.join(cmd).is_file() {
                return true;
            }
        }
    }
    false
}

fn check_linux_servicemenu_status() -> (bool, Option<String>) {
    let servicemenu_dirs = get_dolphin_servicemenu_dirs();
    for dir in &servicemenu_dirs {
        let file_path = dir.join("liquid-image-actions.desktop");
        if file_path.exists() {
            return (true, Some(file_path.to_string_lossy().to_string()));
        }
    }
    (false, None)
}

#[cfg(target_os = "windows")]
mod windows_impl {
    use super::*;
    use winreg::enums::*;
    use winreg::RegKey;

    const HKCU_IMAGE_SHELL: &str = r"Software\Classes\SystemFileAssociations\image\shell";
    const EXTRA_EXTENSIONS: &[&str] = &[
        ".webp", ".avif", ".heic", ".heif", ".jxl", ".svg", ".ico", ".tiff", ".tif"
    ];

    fn populate_liquid_menu(
        liquid_key: &RegKey,
        exe_quoted: &str,
        formats: &[String],
    ) -> Result<(), String> {
        liquid_key
            .set_value("MUIVerb", &"Convert with Liquid Image")
            .map_err(|e| e.to_string())?;
        liquid_key
            .set_value("SubCommands", &"")
            .map_err(|e| e.to_string())?;
        liquid_key
            .set_value("Icon", &exe_quoted)
            .map_err(|e| e.to_string())?;

        let (sub_shell, _) = liquid_key
            .create_subkey("shell")
            .map_err(|e| e.to_string())?;

        for fmt in formats {
            let clean = fmt.trim().trim_start_matches('.').to_lowercase();
            if clean.is_empty() {
                continue;
            }
            let action_key_name = format!("Convert{}", capitalize(&clean));
            let action_label = format!("Convert to {}", clean.to_uppercase());
            let (action_key, _) = sub_shell
                .create_subkey(&action_key_name)
                .map_err(|e| e.to_string())?;

            action_key
                .set_value("", &action_label)
                .map_err(|e| e.to_string())?;

            let (cmd_key, _) = action_key
                .create_subkey("command")
                .map_err(|e| e.to_string())?;

            let cmd_str = format!("{} --headless --convert-to {} \"%1\"", exe_quoted, clean);
            cmd_key.set_value("", &cmd_str).map_err(|e| e.to_string())?;
        }

        // OpenInApp action
        let (open_key, _) = sub_shell
            .create_subkey("OpenInApp")
            .map_err(|e| e.to_string())?;
        open_key
            .set_value("", &"Open with Liquid Image")
            .map_err(|e| e.to_string())?;
        let (cmd_key, _) = open_key
            .create_subkey("command")
            .map_err(|e| e.to_string())?;
        let cmd_str = format!("{} --open \"%1\"", exe_quoted);
        cmd_key.set_value("", &cmd_str).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn check_status() -> Result<(bool, Option<String>), String> {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let path = format!(r"{}\LiquidImage", HKCU_IMAGE_SHELL);
        if hkcu.open_subkey(&path).is_ok() {
            Ok((true, Some(format!(r"HKEY_CURRENT_USER\{}", path))))
        } else {
            Ok((false, None))
        }
    }

    pub fn register(formats: &[String]) -> Result<String, String> {
        let current_exe = std::env::current_exe()
            .map_err(|e| format!("Failed to get current executable path: {e}"))?;
        let exe_str = current_exe.to_str().ok_or("Invalid UTF-8 in exe path")?;
        let exe_quoted = format!("\"{}\"", exe_str);

        let hkcu = RegKey::predef(HKEY_CURRENT_USER);

        // 1. Register for generic "image" class (jpg, png, bmp, etc.)
        let (image_shell_key, _) = hkcu
            .create_subkey(HKCU_IMAGE_SHELL)
            .map_err(|e| format!("Failed to create/open shell registry key: {e}"))?;
        let (image_liquid_key, _) = image_shell_key
            .create_subkey("LiquidImage")
            .map_err(|e| format!("Failed to create LiquidImage key: {e}"))?;
        populate_liquid_menu(&image_liquid_key, &exe_quoted, formats)?;

        // 2. Register for specific modern extensions (webp, avif, heic, etc.)
        // which Windows does not categorize under SystemFileAssociations\image by default
        for ext in EXTRA_EXTENSIONS {
            // Set PerceivedType = "image"
            if let Ok((ext_key, _)) = hkcu.create_subkey(format!(r"Software\Classes\{}", ext)) {
                let _ = ext_key.set_value("PerceivedType", &"image");
            }

            // Register SystemFileAssociations\<ext>\shell\LiquidImage
            let ext_shell_path = format!(r"Software\Classes\SystemFileAssociations\{}\shell", ext);
            if let Ok((ext_shell_key, _)) = hkcu.create_subkey(&ext_shell_path) {
                if let Ok((ext_liquid_key, _)) = ext_shell_key.create_subkey("LiquidImage") {
                    let _ = populate_liquid_menu(&ext_liquid_key, &exe_quoted, formats);
                }
            }
        }

        Ok(format!(r"HKEY_CURRENT_USER\{}\LiquidImage", HKCU_IMAGE_SHELL))
    }

    pub fn unregister() -> Result<(), String> {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if let Ok(shell_key) = hkcu.open_subkey_with_flags(HKCU_IMAGE_SHELL, KEY_ALL_ACCESS) {
            let _ = shell_key.delete_subkey_all("LiquidImage");
        }

        for ext in EXTRA_EXTENSIONS {
            let ext_shell_path = format!(r"Software\Classes\SystemFileAssociations\{}\shell", ext);
            if let Ok(ext_shell_key) = hkcu.open_subkey_with_flags(&ext_shell_path, KEY_ALL_ACCESS) {
                let _ = ext_shell_key.delete_subkey_all("LiquidImage");
            }
        }

        Ok(())
    }
}

#[command]
pub fn check_context_menu_status() -> Result<ContextMenuStatus, String> {
    if cfg!(target_os = "linux") {
        let is_dolphin_installed =
            Path::new("/usr/bin/dolphin").exists() || is_executable_in_path("dolphin");
        let (is_registered, installed_path) = check_linux_servicemenu_status();
        Ok(ContextMenuStatus {
            platform: "linux".into(),
            is_supported: is_dolphin_installed,
            is_registered,
            installed_path,
            configured_formats: Vec::new(),
        })
    } else if cfg!(target_os = "windows") {
        #[cfg(target_os = "windows")]
        {
            let (is_registered, installed_path) = windows_impl::check_status()?;
            Ok(ContextMenuStatus {
                platform: "windows".into(),
                is_supported: true,
                is_registered,
                installed_path,
                configured_formats: Vec::new(),
            })
        }
        #[cfg(not(target_os = "windows"))]
        {
            Ok(ContextMenuStatus {
                platform: "windows".into(),
                is_supported: true,
                is_registered: false,
                installed_path: None,
                configured_formats: Vec::new(),
            })
        }
    } else if cfg!(target_os = "macos") {
        Ok(ContextMenuStatus {
            platform: "macos".into(),
            is_supported: false,
            is_registered: false,
            installed_path: None,
            configured_formats: Vec::new(),
        })
    } else {
        Ok(ContextMenuStatus {
            platform: "other".into(),
            is_supported: false,
            is_registered: false,
            installed_path: None,
            configured_formats: Vec::new(),
        })
    }
}

#[command]
pub fn register_context_menu(formats: Vec<String>) -> Result<String, String> {
    let effective_formats = if formats.is_empty() {
        vec!["webp".into(), "png".into(), "jpeg".into(), "avif".into()]
    } else {
        formats
    };

    if cfg!(target_os = "linux") {
        register_dolphin_servicemenu(effective_formats)
    } else if cfg!(target_os = "windows") {
        #[cfg(target_os = "windows")]
        {
            windows_impl::register(&effective_formats)
        }
        #[cfg(not(target_os = "windows"))]
        {
            let _ = effective_formats;
            Err("Windows registry integration can only be registered when running on Windows".into())
        }
    } else {
        Err("Context menu integration is not supported on this operating system".into())
    }
}

#[command]
pub fn unregister_context_menu() -> Result<(), String> {
    if cfg!(target_os = "linux") {
        unregister_dolphin_servicemenu()
    } else if cfg!(target_os = "windows") {
        #[cfg(target_os = "windows")]
        {
            windows_impl::unregister()
        }
        #[cfg(not(target_os = "windows"))]
        {
            Err("Windows registry integration can only be unregistered when running on Windows".into())
        }
    } else {
        Ok(())
    }
}

#[command]
pub fn check_dolphin_integration_status() -> Result<DolphinIntegrationStatus, String> {
    check_context_menu_status()
}

#[command]
pub fn register_dolphin_servicemenu(formats: Vec<String>) -> Result<String, String> {
    if !cfg!(target_os = "linux") {
        return Err("Dolphin ServiceMenu is only available on Linux".into());
    }

    let effective_formats = if formats.is_empty() {
        vec!["webp".into(), "png".into(), "jpeg".into(), "avif".into()]
    } else {
        formats
    };

    let content = generate_servicemenu_desktop(&effective_formats);
    let servicemenu_dirs = get_dolphin_servicemenu_dirs();
    let mut installed_locations = Vec::new();

    for dir in servicemenu_dirs {
        if let Err(e) = fs::create_dir_all(&dir) {
            eprintln!("[servicemenu] Failed to create dir {:?}: {e}", dir);
            continue;
        }
        let file_path = dir.join("liquid-image-actions.desktop");
        if let Err(e) = fs::write(&file_path, &content) {
            eprintln!("[servicemenu] Failed to write {:?}: {e}", file_path);
            continue;
        }

        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let _ = fs::set_permissions(&file_path, fs::Permissions::from_mode(0o755));
        }

        installed_locations.push(file_path.to_string_lossy().to_string());
    }

    if installed_locations.is_empty() {
        return Err("Failed to install ServiceMenu to any KDE directory".into());
    }

    Ok(installed_locations.join(", "))
}

#[command]
pub fn unregister_dolphin_servicemenu() -> Result<(), String> {
    let servicemenu_dirs = get_dolphin_servicemenu_dirs();
    for dir in servicemenu_dirs {
        let file_path = dir.join("liquid-image-actions.desktop");
        if file_path.exists() {
            let _ = fs::remove_file(file_path);
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_servicemenu_desktop() {
        let formats = vec!["webp".to_string(), "png".to_string()];
        let content = generate_servicemenu_desktop(&formats);
        assert!(content.contains("[Desktop Entry]"));
        assert!(content.contains("Actions=ConvertWebp;ConvertPng;OpenInApp;"));
        assert!(content.contains("[Desktop Action ConvertWebp]"));
        assert!(content.contains("Name=Convert to WEBP"));
        assert!(content.contains("[Desktop Action ConvertPng]"));
        assert!(content.contains("Name=Convert to PNG"));
        assert!(content.contains("[Desktop Action OpenInApp]"));
        assert!(content.contains("X-KDE-Submenu=Convert with Liquid Image"));
    }

    #[test]
    fn test_check_context_menu_status() {
        let status = check_context_menu_status().expect("status should succeed");
        assert!(!status.platform.is_empty());
    }
}
