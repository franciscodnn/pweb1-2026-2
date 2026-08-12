[main](../../README.md)

# Aula 14 — Introdução ao Spring Boot 4

> **Spring Boot** é um framework que simplifica a criação de aplicações Spring stand-alone, de nível de produção, com o mínimo de configuração possível.

---

## 1. O que é Spring Boot?

Spring Boot é uma extensão do **Spring Framework** que visa **eliminar a complexidade** de configuração manual. Em vez de definir beans em XML ou classes de configuração extensas, o Spring Boot adota uma abordagem **opinionada** (opiniada): ele assume configurações sensatas por padrão e permite que você as sobrescreva quando necessário.

### Principais características

- **Standalone**: a aplicação empacota tudo (incluindo o servidor web) em um único JAR executável.
- **Auto-configuração**: configura automaticamente componentes com base nas dependências presentes no classpath.
- **Sem XML**: configuração 100% baseada em anotações e propriedades.
- **Embedded servers**: Tomcat, Jetty ou Undertow embutidos — não é necessário deploy em servidor externo.
- **Starters**: conjuntos pré-configurados de dependências para funcionalidades comuns (web, dados, segurança, etc.).

---

## 2. Requisitos do Sistema (Spring Boot 4.0)

Antes de iniciar um projeto, verifique se seu ambiente atende aos requisitos mínimos.

### Java

| Requisito | Versão |
|---|---|
| **Mínimo** | Java 17 |
| **Compatível** | Java 17 até Java 26 |

### Spring Framework

| Requisito | Versão |
|---|---|
| **Necessário** | Spring Framework 7.0.7 ou superior |

### Build Tools

| Ferramenta | Versão |
|---|---|
| **Maven** | 3.6.3 ou posterior |
| **Gradle** | 8.x (8.14+) ou 9.x |

### Servidores Servlet Embutidos

| Servidor | Versão Servlet |
|---|---|
| **Tomcat 11.0.x** | Servlet 6.1 |
| **Jetty 12.1.x** | Servlet 6.1 |

> **Nota**: Você também pode fazer deploy em qualquer container Servlet 6.1+ compatível (ex: WildFly, GlassFish).

### GraalVM Native Images

| Ferramenta | Versão |
|---|---|
| **GraalVM Community** | 25 |
| **Native Build Tools** | 0.11.5 |

---

## 3. Instalando o Spring Boot CLI

O **Spring Boot CLI** (Command Line Interface) é uma ferramenta de linha de comando útil para prototipação rápida. **Não é obrigatório** — a maioria dos desenvolvedores usa o Spring Initializr via IDE ou navegador.

### Opção 1: SDKMAN! (Linux/Mac)

```bash
$ sdk install springboot
$ spring --version
Spring CLI v4.0.6
```

### Opção 2: Homebrew (Mac)

```bash
$ brew tap spring-io/tap
$ brew install spring-boot
```

### Opção 3: Scoop (Windows)

```bash
$ scoop bucket add extras
$ scoop install springboot
```

### Opção 4: Download Manual

Baixe o arquivo `.zip` ou `.tar.gz` do CLI em [spring.io](https://spring.io) e siga as instruções do `INSTALL.txt`.

### Comandos úteis do CLI

```bash
# Criar um novo projeto rapidamente
$ spring init --dependencies=web,data-jpa my-project

# Executar um script Groovy diretamente
$ spring run app.groovy

# Codificar uma senha
$ spring encodepassword minhaSenha123
```

---

## 4. Sistema de Build com Maven

O Maven é o sistema de build mais utilizado em projetos Spring Boot. O Spring Boot fornece um **parent POM** que gerencia versões de dependências automaticamente.

### Estrutura mínima do `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- Parent POM do Spring Boot -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.6</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>minha-aplicacao</artifactId>
    <version>1.0.0</version>
    <name>Minha Aplicacao</name>
    <description>Projeto de exemplo com Spring Boot 4</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Starter para aplicações web (Spring MVC + Tomcat) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>

        <!-- Starter para testes -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Plugin que empacota a aplicação como JAR executável -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### O que o `spring-boot-starter-parent` faz?

- Define a **versão padrão** do Java (via `<java.version>`).
- Gerencia as **versões compatíveis** de todas as dependências Spring e de terceiros (bomba de versões transitivas).
- Configura o **plugin do Spring Boot** para empacotar como JAR executável.
- Define **encoding UTF-8** e outras convenções de build.

### Starters mais comuns

| Starter | Descrição |
|---|---|
| `spring-boot-starter-webmvc` | Spring MVC + Tomcat embutido |
| `spring-boot-starter-webflux` | Programação reativa com WebFlux |
| `spring-boot-starter-data-jpa` | Spring Data JPA + Hibernate |
| `spring-boot-starter-data-jdbc` | Spring Data JDBC (mais leve que JPA) |
| `spring-boot-starter-data-mongodb` | MongoDB com Spring Data |
| `spring-boot-starter-data-redis` | Redis com Spring Data |
| `spring-boot-starter-security` | Spring Security |
| `spring-boot-starter-validation` | Bean Validation (Hibernate Validator) |
| `spring-boot-starter-test` | JUnit 5, Mockito, Hamcrest, AssertJ |
| `spring-boot-starter-actuator` | Endpoints de monitoramento e métricas |
| `spring-boot-starter-thymeleaf` | Thymeleaf como engine de templates |

> **Convenção de nomenclatura**: todos os starters oficiais seguem o padrão `spring-boot-starter-*`.

---

## 5. Estrutura de Código

O Spring Boot **não impõe** uma estrutura de diretórios específica, mas existem **boas práticas** fortemente recomendadas.

### Regra de ouro: pacote raiz

A classe principal (com `@SpringBootApplication`) deve estar no **pacote raiz**, acima de todos os outros pacotes. Isso garante que o **component scan** encontre automaticamente todos os beans do seu projeto.

### Layout típico recomendado

```
com
 └── exemplo
      └── minhaaplicacao
           ├── MinhaAplicacao.java          ← Classe principal (raiz)
           │
           ├── cliente
           │   ├── Cliente.java             ← Entidade/Modelo
           │   ├── ClienteController.java   ← Controller (REST)
           │   ├── ClienteService.java      ← Service (regras de negócio)
           │   └── ClienteRepository.java   ← Repository (acesso a dados)
           │
           └── pedido
               ├── Pedido.java
               ├── PedidoController.java
               ├── PedidoService.java
               └── PedidoRepository.java
```

### Classe principal

```java
package com.exemplo.minhaaplicacao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // Combina @Configuration, @EnableAutoConfiguration e @ComponentScan
public class MinhaAplicacao {

    public static void main(String[] args) {
        SpringApplication.run(MinhaAplicacao.class, args);
    }
}
```

### O que `@SpringBootApplication` faz?

É uma **meta-anotação** que equivale a:

```java
@Configuration              // Marca a classe como fonte de beans
@EnableAutoConfiguration    // Ativa a auto-configuração baseada no classpath
@ComponentScan              // Escaneia componentes no pacote atual e subpacotes
```

> **Atenção**: o `@ComponentScan` usa o **pacote da classe anotada** como base. Se você colocar a classe principal em um subpacote, beans em pacotes irmãos ou superiores **não serão encontrados**.

### Anti-padrão: pacote padrão (default package)

```java
// ❌ EVITE — sem declaração de package
public class MinhaAplicacao {
    // ...
}
```

Sem pacote definido, o `@ComponentScan` escaneará **todas as classes de todos os JARs** no classpath, causando:
- Lentidão na inicialização.
- Conflitos de beans inesperados.
- Comportamento não determinístico.

**Sempre use um pacote nomeado** (ex: `com.exemplo.minhaaplicacao`).

---

## 6. Criando sua primeira aplicação

### Passo 1: Criar o projeto

Use o [Spring Initializr](https://start.spring.io/) ou o CLI:

```bash
$ spring init --build=maven --java-version=17     --dependencies=webmvc     --package-name=com.exemplo.demo     --name=demo     demo
```

### Passo 2: Classe principal

```java
package com.exemplo.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### Passo 3: Controller REST

```java
package com.exemplo.demo.saudacao;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController  // Combina @Controller + @ResponseBody
public class SaudacaoController {

    @GetMapping("/saudacao")
    public String saudar(@RequestParam(defaultValue = "Mundo") String nome) {
        return "Olá, " + nome + "!";
    }
}
```

### Passo 4: Executar

```bash
$ ./mvnw spring-boot:run
```

Ou compile e execute o JAR:

```bash
$ ./mvnw clean package
$ java -jar target/demo-1.0.0.jar
```

### Testando

```bash
$ curl "http://localhost:8080/saudacao?nome=Spring"
Olá, Spring!
```

---

## 7. Resumo dos conceitos

| Conceito | Descrição |
|---|---|
| **Spring Boot** | Framework opinionado que simplifica aplicações Spring |
| **Starter** | Conjunto pré-configurado de dependências (`spring-boot-starter-*`) |
| **Auto-configuração** | Configuração automática baseada no classpath |
| **Embedded Server** | Tomcat/Jetty dentro do JAR — sem deploy externo |
| **Parent POM** | Gerencia versões de dependências automaticamente |
| **@SpringBootApplication** | Meta-anotação que ativa configuração + scan |
| **Component Scan** | Busca automática de beans a partir do pacote raiz |
| **JAR executável** | `java -jar` roda a aplicação completa com servidor |

---

## 8. Referências

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/index.html)
- [System Requirements](https://docs.spring.io/spring-boot/system-requirements.html)
- [Installing Spring Boot](https://docs.spring.io/spring-boot/installing.html)
- [Build Systems](https://docs.spring.io/spring-boot/reference/using/build-systems.html)
- [Structuring Your Code](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)
- [Spring Initializr](https://start.spring.io/)
