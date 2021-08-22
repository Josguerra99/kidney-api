

SET SQL_SAFE_UPDATES = 0;
USE kidney_hope;

DELETE FROM paciente;
DELETE FROM donador;
DELETE FROM antigeno;

USE hospital;
DELETE FROM kidney_donor;
DELETE FROM test_info;
DELETE FROM patient_parents;
DELETE FROM patient;

SET SQL_SAFE_UPDATES = 1;

/** ACTIVAR EL MODULO EN LA BASE DE DATOS **/
UPDATE hospital SET 
module='accountant,appointment,lab,bed,department,doctor,donor,finance,pharmacy,laboratorist,medicine,nurse,patient,pharmacist,prescription,receptionist,report,notice,email,sms,kidney' 
WHERE id=466;





