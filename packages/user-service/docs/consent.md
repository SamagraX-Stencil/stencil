### Consent structure

```xml
 <Consent xmlns="http://meity.gov.in" timestamp="YYYY-MM-DDThh:mm:ssZn.n">
    <Def id="" expiry="" revocable="" />

    <!-- Identifiers -->
    <Collector type="URI" value="" />

    <DataConsumer type="URI" value="" >
        <Notify event="REVOKE" type="URI" value="" />
    </DataConsumer>

    <DataProvider type="URI" value="" >
        <Notify event="REVOKE" type="URI" value="" />
    </DataProvider>

    <User type="AADHAAR|MOBILE|PAN|PASSPORT|..." value="" name="" issuer="" >
        <!-- User’s account IDs at DP/DC/CM; required to disambiguate-->
        <Account dpID="" dcID="" cmID="" />
    </User>

    <!-- Revoker details should be specified if consent is revocable -->
    <Revoker type="URI" value="" />

    <!-- Logging; logTo can be any valid URI including an email address -->
    <ConsentUse logTo="" type="URI" />
    <DataAccess logTo="" type="URI" />
    <Data-Items>
    <!-- following element repeats -->
        <Data id="" type="TRANSACTIONAL|PROFILE|DOCUMENT">
            <Access mode="VIEW|STORE|QUERY" />
            <!-- how long can consumer is allowed to store data -->
            <Datalife unit="MONTH|YEAR|DATE|INF" value="" />
            <!-- frequency and number of repeats for access repeats -->
            <Frequency unit="DAILY|MONTHLY|YEARLY" value="" repeats="" />
            <Data-filter>
                <-- Data access filter, any encoded query string
                as per data provider API needs -->
            </Data-filter>
        </Data>
    </Data-Items>
    <!-- Purpose attributes -->
    <Purpose code="" defUri="" refUri="">
    <!-- purpose text goes here -->
    </Purpose>
    <!-- (OPTIONAL) User Signature block -->
    <Signature />
    <!-- Consent collector Signature block -->
    <Signature />
 </Consent>
```

### Revoke structure

```xml
<RevocationReq xmlns="http://meity.gov.in" timestamp="YYYY-MM-DDThh:mm:ssZn.n">
    <!-- entity creating the request -->
    <From type="URI" value="" />
    <!-- consent artifact -->
    <Consent> base-64 encoded consent artifact as-is </Consent>
    <!-- OPTIONAL User signature block -->
    <Signature />
    <!-- Requestor signature block -->
    <Signature />
</RevocationReq>
```

### Logging structure

```xml
<ConsentLog xmlns="http://meity.gov.in" timestamp="YYYY-MM-DDThh:mm:ssZn.n">
    <!-- entity creating the log request -->
    <LogFrom type="URI" value="" />
    <Event type="CONSENT-CREATED | CONSENT-REVOKED | DATA-REQUESTED | DATA-SENT
    | DATA-DENIED" note="">
    <!-- consent artifact -->
    <Consent />
    <!-- information about data items shared -->
    <Data-Items>
        <!-- following element repeats -->
        <Data-Item id="" desc="" />
    </Data-Items>
    <!-- Log creator’s signature block -->
    <Signature />
 </ConsentLog>
```

---

### Definition

1. **User** — any person or entity who wishes to share data about them for availing a service.
2. **Data Provider (DP)** — Any entity which has data about users in their system that can either be given to the user (whose data it is) or to another entity based on the consented request of the user.
3. **Data Consumer (DC)** — Any entity which accesses data for providing a service to the user.
4. **Consent Collector (CC)** — An entity that interacts with users and obtains consent from them for any intended access to data. This role may be played by the Data Consumer (in most cases) or the Data Provider or could be another service provider.

### Modules

0. Consent Manager (alias Consent Collector)
   - Store of all the consents at one place (first XML)
   - APIs
     - Create Consent Request - `/consent/create`
     - Get Consent Request Status - `/consent/status`
     - Get Consent Artifact - `/consent/:id`
     - Accept Consent - `/consent/:id/accept`
     - Deny Consent - `/consent/:id/deny`
     - Revoke Consent - `/consent/:id/revoke`
1. Notification Manager
   - Sends notifications
   - APIs - Internal
     - Send Consent Notification - `/notification/consent/:id/send`. Sends notification to both
2. Auth + Signature/Token Manager
   - Creates tokens and certificates
   - Deletes them once the job is done
   - Revokes tokens
   - APIs [Not adding the digital identity APIs]
     - Generate token for consent - `/token/consent/:id/generate`
     - Revoke all tokens for consent - `/token/consent/:id/revoke`
3. Data Manager
   - Manages how to interact with diverse data structures through interfaces
   - Enforcement of the consent happens on the API end (The person managing the API) - Example Hasura
4. Logger

### Notes

1. Currently there is no way repeats can be handled using existing tokens.

---

### Annexure

1. [Meity Doc](http://dla.gov.in/sites/default/files/pdf/MeitY-Consent-Tech-Framework%20v1.1.pdf) from which this is blatantly copied.
2. [Digital Locker](http://dla.gov.in/sites/default/files/pdf/DigitalLockerTechnologyFramework%20v1.1.pdf)
3. [Sample Flows](https://projecteka.github.io/content/sequencediagrams.html)
4. https://app.diagrams.net/#G1IljJY-VUlNITYYP3iQppmodLbjMJsvLO
