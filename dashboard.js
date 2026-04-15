{% extends "base.html" %}
{% block title %}Dashboard — Cyber Threat Detection{% endblock %}
{% block head %}
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
{% endblock %}

{% block content %}
<h2 class="page-title">System Dashboard</h2>

<div class="dash-metrics" id="dashMetrics">
  <div class="dash-metric">
    <div class="dash-metric-val accent" id="dmAcc">—</div>
    <div class="dash-metric-lbl">Global Accuracy</div>
  </div>
  <div class="dash-metric">
    <div class="dash-metric-val" id="dmRounds">—</div>
    <div class="dash-metric-lbl">Rounds Completed</div>
  </div>
  <div class="dash-metric">
    <div class="dash-metric-val danger" id="dmThreats">—</div>
    <div class="dash-metric-lbl">Threats Detected</div>
  </div>
  <div class="dash-metric">
    <div class="dash-metric-val" id="dmClients">—</div>
    <div class="dash-metric-lbl">Edge Clients</div>
  </div>
</div>

<div class="dash-grid">
  <div class="panel">
    <div class="panel-title accent">Accuracy / Loss Over Rounds</div>
    <div style="position:relative;height:220px">
      <canvas id="dashChart"></canvas>
    </div>
  </div>

  <div class="panel">
    <div class="panel-title accent">Attack Distribution</div>
    <div style="position:relative;height:220px">
      <canvas id="pieChart"></canvas>
    </div>
  </div>
</div>

<div class="panel" id="dashFeedPanel">
  <div class="panel-title accent">Live Detection Feed</div>
  <div id="dashFeedEmpty" style="color:#8899aa;font-size:13px;padding:16px 0">
    No detections yet. <a href="/train" class="accent">Train a model</a> and run detection first.
  </div>
  <div style="overflow-x:auto">
    <table class="flows-table hidden" id="dashFeedTable">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Source IP</th>
          <th>Protocol</th>
          <th>Prediction</th>
          <th>Confidence</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="dashFeedBody"></tbody>
    </table>
  </div>
</div>

{% endblock %}

{% block scripts %}
<script src="{{ url_for('static', filename='js/dashboard.js') }}"></script>
{% endblock %}
