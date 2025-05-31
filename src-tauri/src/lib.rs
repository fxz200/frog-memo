
use tauri_plugin_store::StoreExt;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri::Manager;
                use tauri::WebviewUrl;
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
                };
                let _store = app.store("store.json")?;
                let my_shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Backquote);
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app, shortcut, event| {
                            if shortcut == &my_shortcut {
                                match event.state() {
                                    ShortcutState::Pressed => {
                                        let windows = app.webview_windows();
                                        if let Some(window) = app.get_webview_window("main") {
                                            match (window.is_visible(), window.is_minimized()) {
                                                (Ok(true), Ok(true)) => {
                                                    // 視窗被最小化，需要恢復
                                                    let unminimize_result = window.unminimize();
                                                    let show_result = window.show();
                                                    let focus_result = window.set_focus();
                                                },
                                                (Ok(true), Ok(false)) => {
                                                    // 視窗可見且未被最小化，進行最小化
                                                    let minimize_result = window.minimize();
                                                },
                                                _ => {
                                                    // 其他情況（不可見或檢查失敗），顯示視窗
                                                    let _ = window.unminimize();
                                                    let show_result = window.show();
                                                    let focus_result = window.set_focus();
                                                }
                                            }
                                        } else {
                                            #[cfg(not(target_os = "android"))]
                                            {
                                                use tauri::WebviewWindowBuilder;
                                                let settings_window = WebviewWindowBuilder::new(
                                                    app,
                                                    "main",
                                                    WebviewUrl::App("index.html".into()),
                                                )
                                                .title("frog-memo")
                                                .inner_size(800.0, 600.0)
                                                .build();
                                            }
                                        }
                                    }
                                    ShortcutState::Released => {
                                        // println!("Ctrl-N Released!");
                                    }
                                }
                            }
                        })
                        .build(),
                )?;
                app.global_shortcut().register(my_shortcut)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
