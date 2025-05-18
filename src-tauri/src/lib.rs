
use tauri_plugin_store::StoreExt;
use serde_json::json;
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
                let store = app.store("store.json")?;
                store.set("some-key", json!({ "value": 5 }));
                let value = store.get("some-key").expect("Failed to get value from store");
                println!("{}", value); // {"value":5}

                    // Remove the store from the resource table
                // store.close_resource();
                let ctrl_n_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyN);
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app, shortcut, event| {
                            println!("{:?}", shortcut);
                            if shortcut == &ctrl_n_shortcut {
                                match event.state() {
                                    ShortcutState::Pressed => {
                                        println!(
                                            "Ctrl-N Pressed - Attempting to open settings window!"
                                        );

                                        let windows = app.webview_windows();
                                        println!(
                                            "Available windows: {:?}",
                                            windows.keys().collect::<Vec<_>>()
                                        );
                                        if let Some(window) = app.get_webview_window("main") {
                                            let _ = window.unminimize();
                                            println!(
                                                "Settings window found! Attempting to show..."
                                            );
                                            let show_result = window.show();
                                            println!("Show result: {:?}", show_result);
                                            let focus_result = window.set_focus();
                                            println!("Focus result: {:?}", focus_result);
                                        } else {
                                            println!(
                                                "Settings window not found! Creating a new one..."
                                            );
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
                                                println!(
                                                    "Window creation result: {:?}",
                                                    settings_window
                                                );
                                            }
                                        }
                                    }
                                    ShortcutState::Released => {
                                        println!("Ctrl-N Released!");
                                    }
                                }
                            }
                        })
                        .build(),
                )?;
                app.global_shortcut().register(ctrl_n_shortcut)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
