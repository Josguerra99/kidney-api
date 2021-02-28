
CREATE TABLE paciente(
	id VARCHAR(11) PRIMARY KEY,
	tipo_sangre VARCHAR(10)
);


CREATE TABLE donador(
	id VARCHAR(11) PRIMARY KEY,
	id_paciente VARCHAR(11),
	activo BOOLEAN DEFAULT TRUE,
	tipo_sangre VARCHAR(10),
  	FOREIGN KEY (id_paciente) REFERENCES paciente(id)
);



CREATE TABLE antigeno(
	id INT PRIMARY KEY AUTO_INCREMENT,
	id_persona VARCHAR(11) NOT NULL,
	nombre VARCHAR(10)
);
