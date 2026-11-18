<?php
// Al borrar el plugin desde WordPress se eliminan sus dos ajustes.
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'mgw_live' );
delete_option( 'mgw_version' );
