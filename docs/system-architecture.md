# System Architecture

## System Context C4 Diagram

```mermaid
C4Context

    Person_Ext(leaAdmin, "LEA Administrator", "desc...")
    System_Ext(auth, "Identity Provider", "Open ID Connect compatible IdP")
        System_Ext(aws, "AWS Services")

    Enterprise_Boundary(b0, "Starting Blocks Environment (SBE)") {
        Person(sysAdmin, "System Administrator")

        System(sbaa, "SBAA", "Starting Blocks Admin App")
        System(lambdas, "SBE Functions", "Lambdas")

        System(edfi1, "Ed-Fi Env 1", "ODS/API, AdminApi, databases")
        System(edfi2, "Ed-Fi Env 2", "ODS/API, AdminApi, databases")
        System(edfi3, "...", "")
    }

    Rel(leaAdmin, auth, "https")
    Rel(leaAdmin, sbaa, "https")

    Rel(sysAdmin, auth, "https")
    Rel(sysAdmin, sbaa, "https")

    Rel(sbaa, lambdas, "https")
    Rel(sbaa, edfi1, "https")
    Rel(lambdas, edfi1, "https<br/>postgresql")
    Rel(sbaa, edfi2, "https")
    Rel(lambdas, edfi2, "https<br/>postgresql")
    Rel(sbaa, edfi3, "https")
    Rel(lambdas, edfi3, "https<br/>postgresql")

    Rel(lambdas, aws, "")

    UpdateRelStyle(lambdas, odsApi, $offsetX="90", $offsetY="-20")


    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

The Starting Blocks Admin App (SBAA) is a centralized management system that operates within a Starting Blocks Environment (SBE) to orchestrate multiple Ed-Fi deployments. The system serves two primary user types: LEA Administrators who manage local educational data environments, and System Administrators who oversee the entire infrastructure.

The SBAA acts as a control plane that communicates with various Ed-Fi environments (each containing ODS/API, Admin API, and associated databases). It leverages AWS Lambda functions (SBE Functions) to perform automated operations across these environments, including execution of limited custom SQL commands via PostgreSQL connections.

Authentication is handled through an external OpenID Connect-compatible Identity Provider, ensuring secure access for all users. The system provides a unified interface for managing multiple Ed-Fi instances while maintaining isolation between different educational environments, enabling scalable administration of educational data systems across multiple tenants or organizations.

## System Containers C4 Diagram

```mermaid
C4Container

    Enterprise_Boundary(b0, "SBE") {
        Container(sbaaUI, "SBAA UI", "Node.js / static site")
        Container(sbaaApi, "SBAA API", "Node.js")
        Container(lambdas, "SBE Functions", "Lambdas")

        ContainerDb(sbaaDb, "SBAA DB", "PostgreSQL")
    }

    Enterprise_Boundary(b1, "Ed-Fi") {
        Container(odsApi, "ODS/API 6.x or 7.x", ".NET")
        Container(adminApi, "Admin API 1.x or 2.x", ".NET")

        ContainerDb(ods, "EdFi_Ods", "PostgreSQL")
        ContainerDb(admin, "EdFi_Admin", "PostgreSQL")
        ContainerDb(security, "EdFi_Security", "PostgreSQL")
    }

    Rel(sbaaUI, sbaaApi, "https")
    Rel(sbaaApi, adminApi, "https")
    Rel(sbaaApi, sbaaDb, "postgresql")
    Rel(sbaaApi, lambdas, "https")

    Rel(lambdas, ods, "runs custom queries")
    UpdateRelStyle(lambdas, ods, $textColor="red", $lineColor="red", $offsetX="100", $offsetY="-20")

    Rel(odsApi, ods, "postgresql")
    Rel(odsApi, admin, "postgresql")
    Rel(odsApi, security, "postgresql")

    Rel(adminApi, admin, "postgresql")
    Rel(adminApi, security, "postgresql")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

For simplicity, the Containers diagram only shows a single Ed-Fi deployment. The SBAA API application serves as a dedicated backend-for-frontend (BFF) application for the SBAA user interfaces. It handles user authorization logic and various tasks. Management of the AWS environment is handled through calls to AWS Lambda functions. Wherever possible, management of the Ed-Fi deployment is handled through calls to the Ed-Fi Admin API. However, there are also Lambda functions for direct integration with the Ed-Fi databases, when the ODS/API and Admin API lack the desired functionality, or there is a clear performance benefit for the end-user. An example of the latter case: a Lambda function uses a highly optimized direct database query in the ODS for near real-time record counts.

Both the custom frontend user interface and the backend API are fully configurable. Sensitive data such as OpenId Connect provider credentials are stored in AWS Secret Manager at runtime.
