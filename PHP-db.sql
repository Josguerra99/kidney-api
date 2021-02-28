
CREATE TABLE kidney_donor(
	id VARCHAR(11) PRIMARY KEY,
	patient_id VARCHAR(100) NOT NULL,
	name VARCHAR(100),
	address VARCHAR(100),
	phone VARCHAR(100),
	birthdate VARCHAR(100),
	sex VARCHAR(100),
	bloodgroup VARCHAR(100),
	FOREIGN KEY (patient_id) REFERENCES patient(patient_id)

);

CREATE TABLE test_info(
	id INT PRIMARY KEY AUTO_INCREMENT,
	patient_id VARCHAR(100),
	donor_id VARCHAR(100),
	ant1 VARCHAR(10),
	ant2 VARCHAR(10),
	ant3 VARCHAR(10),
	ant4 VARCHAR(10),
	ant5 VARCHAR(10),
	ant6 VARCHAR(10),
	bloodgroup VARCHAR(10),
	weight FLOAT,
	birthdate VARCHAR(100),
	sex VARCHAR(100),
	FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
	FOREIGN KEY (donor_id) REFERENCES kidney_donor(id)
);


/** ACTIVAR EL MODULO EN LA BASE DE DATOS **/
UPDATE hospital SET 
module='accountant,appointment,lab,bed,department,doctor,donor,finance,pharmacy,laboratorist,medicine,nurse,patient,pharmacist,prescription,receptionist,report,notice,email,sms,kidney' 
WHERE id=466;





