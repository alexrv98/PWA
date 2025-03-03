<?php

session_start();
unset($_SESSION['auth_token']);
session_destroy();
