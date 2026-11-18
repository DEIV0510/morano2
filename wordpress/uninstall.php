<?php
// Al borrar el plugin se conserva «mgw_live» (publicada o no): en este sitio
// WordPress no puede «reemplazar» un plugin subido, así que para actualizarlo
// se borra y se sube de nuevo, y la web debe seguir publicada al reactivarlo.
// Las imágenes de wp-content/uploads/morano-gruppo-web/ también se conservan.
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'mgw_version' );
