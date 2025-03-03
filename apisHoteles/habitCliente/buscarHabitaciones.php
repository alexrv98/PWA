<?php
require_once '../auth/cors.php';
require_once '../auth/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true);

    $hotelId = $data['hotelId'];
    $fechaInicio = $data['fechaInicio'];
    $fechaFin = $data['fechaFin'];
    $numAdultos = $data['adultos'];
    $numNinos = $data['ninos'];
    $totalHuespedes = $numAdultos + $numNinos;
    $camasSolicitadas = $data['camas'];

    try {

        $fechaInicioObj = new DateTime($fechaInicio);
        $fechaFinObj = new DateTime($fechaFin);
        $diferencia = $fechaInicioObj->diff($fechaFinObj);
        $numeroNoches = $diferencia->days;

        // Consulta todas las habitaciones disponibles
        $stmt = $conn->prepare("
            SELECT 
                ha.id AS habitacion_id,
                ha.numero_habitacion,
                th.nombre AS tipo_habitacion,
                th.capacidad,
                th.camas,
                ha.precio
            FROM habitaciones ha
            JOIN tipos_habitacion th ON ha.tipo_habitacion_id = th.id
            WHERE ha.hotel_id = :hotelId
            AND ha.id NOT IN (
                SELECT r.habitacion_id 
                FROM reservaciones r
                WHERE (r.fecha_inicio <= :fechaFin AND r.fecha_fin >= :fechaInicio)
            )
            ORDER BY ABS(th.capacidad - :totalHuespedes), ABS(th.camas - :camasSolicitadas), ha.precio ASC
        ");

        $stmt->bindParam(':hotelId', $hotelId, PDO::PARAM_INT);
        $stmt->bindParam(':fechaInicio', $fechaInicio, PDO::PARAM_STR);
        $stmt->bindParam(':fechaFin', $fechaFin, PDO::PARAM_STR);
        $stmt->bindParam(':totalHuespedes', $totalHuespedes, PDO::PARAM_INT);
        $stmt->bindParam(':camasSolicitadas', $camasSolicitadas, PDO::PARAM_INT);
        $stmt->execute();

        $habitacionesDisponibles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $habitacionesExactas = [];
        $otrasHabitaciones = [];

        foreach ($habitacionesDisponibles as $habitacion) {
            $capacidadMaxima = $habitacion['capacidad'];
            $precioBase = $habitacion['precio'];
            $precioFinal = $precioBase;
            $mensaje = null;
            $extras = null;
            $extrasTotal = 0;
            $ninosExtras = 0;
            $adultosExtras = 0;
            $costoFinalAdultos = 0;
            $costoFinalNinos = 0;

            // Si el número de huéspedes supera la capacidad de la habitación
            if ($totalHuespedes > $capacidadMaxima) {
                $huespedesExtra = $totalHuespedes - $capacidadMaxima;
                $mensaje = "Capacidad máxima excedida. Se aplicará un cargo extra por huésped adicional.";

                $costoExtraAdulto = round($precioBase * 0.30, 2);
                $costoExtraNino = round($precioBase * 0.15, 2);   

                $ninosExtras = min($huespedesExtra, $numNinos);
                $adultosExtras = max(0, $huespedesExtra - $ninosExtras);

                $extras = $ninosExtras . " niños y " . $adultosExtras . " adultos";
                $extrasTotal = $ninosExtras + $adultosExtras;

                $precioFinal = round($precioBase + ($costoExtraAdulto * $adultosExtras) + ($costoExtraNino * $ninosExtras), 2);
                $costoFinalAdultos = round($costoExtraAdulto * $adultosExtras, 2);
                $costoFinalNinos = round($costoExtraNino * $ninosExtras, 2);
            }

            $precioTotal = round($precioFinal * $numeroNoches, 2);

            $habitacionData = [
                'habitacion_id' => $habitacion['habitacion_id'],
                'numero_habitacion' => $habitacion['numero_habitacion'],
                'tipo_habitacion' => $habitacion['tipo_habitacion'],
                'capacidad' => $habitacion['capacidad'],
                
                'camas' => $habitacion['camas'],
                'precio_base' => round($precioBase, 2),
                'precio_calculado' => round($precioFinal, 2),
                'precio_total' => $precioTotal,
                'mensaje' => $mensaje,
                'extras' => $extras,
                'ninosExtras' => $ninosExtras,
                'adultosExtras' => $adultosExtras,
                'costoFinalAdultos' => $costoFinalAdultos,
                'costoFinalNinos' => $costoFinalNinos,
                'extrasTotal' => $extrasTotal,
            ];

            if ($habitacion['camas'] == $camasSolicitadas) {
                $habitacionesExactas[] = $habitacionData;
            } else {
                $otrasHabitaciones[] = $habitacionData;
            }
        }

        $mensajeBusqueda = null;
        if (empty($habitacionesExactas)) {
            $mensajeBusqueda = "No hay habitaciones con exactamente $camasSolicitadas camas, pero estas opciones pueden interesarle.";
        }

        echo json_encode([
            "status" => "success",
            "mensaje_busqueda" => $mensajeBusqueda,
            "habitacionesExactas" => $habitacionesExactas,
            "otrasHabitaciones" => $otrasHabitaciones,
            "fechaInicio" => $fechaInicio, 
            "fechaFin" => $fechaFin   
        ], JSON_PRETTY_PRINT);
        exit;

    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener habitaciones: " . $e->getMessage()
        ]);
    }
}
?>
